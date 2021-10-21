import { NgbModal }                                                       from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }                                               from '@ngx-translate/core';
import { AfterViewChecked, Component, ElementRef, OnDestroy, Renderer2, } from '@angular/core';
import { forkJoin, Observable, Subject, Subscription }                    from 'rxjs';
import { first, takeUntil }                                               from 'rxjs/operators';
import { LocalDataSource }                                                from 'ng2-smart-table';
import { countries, getDefaultCountryName }                               from '@modules/server.common/data/countries';
import { IGeoLocationCreateObject }                                       from '@modules/server.common/interfaces/IGeoLocation';
import { IInviteCreateObject }                                            from '@modules/server.common/interfaces/IInvite';
import InviteRequest                                                      from '@modules/server.common/entities/InviteRequest';
import { NotifyService }                                                  from '@app/@core/services/notify/notify.service';
import { InvitesRequestsService }                                         from '@app/@core/data/invites-requests.service';
import { InvitesService }                                                 from '@app/@core/data/invites.service';
import { StorageService }                                                 from '@app/@core/data/store.service';
import { StatusComponent }                                                from '@app/@shared/render-component/invites-requests/status/status.component';
import { InvitedDateComponent }                                           from '@app/@shared/render-component/invites-requests/invited-date.component';
import { ConfimationModalComponent }                                      from '@app/@shared/confirmation-modal/confirmation-modal.component';
import { CountryRenderComponent }                                         from '../country-render/country-render.component';
import { InviteViewModel }                                                from '../invites.component';

export interface InviteRequestViewModel
{
	id: string;
	country: string;
	city: string;
	address: string;
	house: string;
	apartment: string;
}

const perPage = 10;

@Component({
	           selector:    'ea-invites-requests',
	           styleUrls:   ['invites-requests.component.scss'],
	           templateUrl: 'invites-requests.component.html',
           })
export class InvitesRequestsComponent implements OnDestroy, AfterViewChecked
{
	public loading: boolean;
	
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	public notInvitedOnly: boolean = true;
	
	private readonly locale: string;
	
	private ngDestroy$ = new Subject<void>();
	private noInfoSign = '';
	private selectedInvitesRequests: any[] = [];
	private addClick: boolean;
	private dataCount: number;
	private $invitesRequests: Subscription;
	private currentPage: number = 1;
	
	constructor(
			private readonly _invitesRequestsService: InvitesRequestsService,
			private readonly _invitesService: InvitesService,
			private readonly _storage: StorageService,
			private readonly _elRef: ElementRef,
			private readonly _renderer: Renderer2,
			private readonly _translateService: TranslateService,
			private readonly _notifyService: NotifyService,
			private readonly modalService: NgbModal
	)
	{
		this.locale = this._storage.locale ?? 'en-US';
		this._loadSettingsSmartTable();
		this._loadDataSmartTable();
		this.smartTableChange();
	}
	
	public ngOnDestroy(): void
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public ngAfterViewChecked(): void
	{
		this.loadSmartTableTranslates();
		
		if(
				this._elRef.nativeElement.querySelector(
						'.ng2-smart-action-add-create'
				)
		)
		{
			const firstRow = 2;
			const columnOffset = 0;
			
			const td = this._renderer.createElement('td');
			
			const tr = this._elRef.nativeElement.getElementsByTagName('tr')[
					firstRow
					];
			
			const refChild = tr.childNodes[columnOffset];
			
			if(!this.addClick)
			{
				this._renderer.insertBefore(tr, td, refChild);
				this.addClick = true;
			}
		}
		else
		{
			this.addClick = false;
		}
	}
	
	public get hasSelectedInvitesRequests(): boolean
	{
		return this.selectedInvitesRequests.length > 0;
	}
	
	public get hasSelectedInvitesRequestsForInvite(): boolean
	{
		return (
				this.selectedInvitesRequests.filter(
						(i: InviteRequest) => !i.isInvited
				).length > 0
		);
	}
	
	public selectInvitesRequestsTmp(ev: { selected: any }): void
	{
		this.selectedInvitesRequests = ev.selected;
	}
	
	public notInvitedOnlyChanged(): void
	{
		this.$invitesRequests.unsubscribe();
		this.notInvitedOnly = !this.notInvitedOnly;
		this._loadDataSmartTable(this.currentPage);
	}
	
	public loadSmartTableTranslates(): void
	{
		this._translateService.onLangChange.subscribe(() => this._loadSettingsSmartTable());
	}
	
	public async createConfirm(e): Promise<void>
	{
		try
		{
			this.loading = true;
			
			const createDataObject =
					      InvitesRequestsComponent.inviteRequestCreateObject(e.newData);
			
			const createInput = await this._invitesRequestsService.getCreateInviteRequestObject(
					createDataObject,
					this.locale
			);
			
			await this._invitesRequestsService
			          .createInviteRequest(createInput)
			          .pipe(first())
			          .toPromise();
			
			e.confirm.resolve();
			
			this.loading = false;
			
			const message = `Invite request was created`;
			
			this._notifyService.success(message);
		} catch(error)
		{
			this.loading = false;
			
			let message = `Something went wrong`;
			
			if(error.message === 'Validation error')
			{
				message = error.message;
			}
			
			this._notifyService.error(message);
		}
		
		// fingerprint2().get(async (uuid, c) => {
		// 	let deviceId;
		// 	const device = await this.deviceService.getByFindInput({ uuid }).pipe(first()).toPromise()
		// 	if (device.length >= 1) {
		// 		deviceId = device[0].id
		// 	} else {
		// 		console.warn(navigator.language);
		
		// 	}
		// 	console.warn(deviceId);
		
		// })
	}
	
	public async deleteConfirm(e): Promise<void>
	{
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size:      'sm',
			container: 'nb-layout',
			backdrop:  'static',
		});
		
		const modalComponent: ConfimationModalComponent =
				      activeModal.componentInstance;
		
		await modalComponent.confirmEvent
		                    .pipe(takeUntil(modalComponent.ngDestroy$))
		                    .subscribe(() =>
		                               {
			                               try
			                               {
				                               this.loading = true;
				
				                               this._invitesRequestsService
				                                   .removeByIds([e.data.id])
				                                   .pipe(first())
				                                   .toPromise();
				
				                               this.loading = false;
				
				                               const message = `Invite request was deleted`;
				
				                               this._notifyService.success(message);
				
				                               e.confirm.resolve();
			                               } catch(error)
			                               {
				                               this.loading = false;
				
				                               const message = `Something went wrong!`;
				
				                               this._notifyService.error(message);
			                               }
			
			                               modalComponent.cancel();
		                               });
	}
	
	public async editConfirm(e): Promise<void>
	{
		try
		{
			this.loading = true;
			const createDataObject: InviteViewModel = InvitesRequestsComponent.inviteRequestCreateObject(
					e.newData
			);
			const updateInput = await this._invitesService.getCreateInviteObject(
					createDataObject,
					this.locale
			);
			
			const res = await this._invitesRequestsService
			                      .updateInviteRequest(e.data.id, updateInput)
			                      .pipe(first())
			                      .toPromise();
			e.confirm.resolve(res);
			this.loading = false;
			const message = `Invite request was updated`;
			this._notifyService.success(message);
		} catch(error)
		{
			this.loading = false;
			const message = `Something went wrong`;
			this._notifyService.error(message);
			console.warn(error);
		}
	}
	
	public async inviteSelectedRows(): Promise<void>
	{
		let succesInvite = 0;
		const invitesRequests = this.selectedInvitesRequests.filter(
				(i: InviteRequest) => !i.isInvited
		);
		for(const inviteRequest of invitesRequests)
		{
			try
			{
				this.loading = true;
				
				await this._invitesService
				          .createInvite(this.getInviteCreateObject(inviteRequest))
				          .pipe(first())
				          .toPromise();
				
				await this._invitesRequestsService
				          .updateInviteRequest(inviteRequest.id, {
					          isInvited:   true,
					          invitedDate: new Date(),
				          })
				          .pipe(first())
				          .toPromise();
				
				this.loading = false;
				
				succesInvite++;
			} catch(error)
			{
				this.loading = false;
				
				const errorMessage = `Something went wrong!`;
				
				this._notifyService.error(errorMessage);
			}
		}
		
		const message = `${succesInvite} success invites`;
		
		this._notifyService.success(message);
		
		this.sourceSmartTable.refresh();
		
		this.selectInvitesRequestsTmp({ selected: [] });
	}
	
	public async deleteSelectedRows(): Promise<void>
	{
		const idsForDelete: string[] = this.selectedInvitesRequests.map(
				(c) => c.id
		);
		
		try
		{
			this.loading = true;
			
			await this._invitesRequestsService
			          .removeByIds(idsForDelete)
			          .pipe(first())
			          .toPromise();
			
			this.loading = false;
			
			const message = `${idsForDelete.length} invites requests was deleted`;
			
			this._notifyService.success(message);
			
			this.selectedInvitesRequests = [];
		} catch(error)
		{
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}
	
	private _loadSettingsSmartTable(): void
	{
		const columnTitlePrefix = 'CUSTOMERS_VIEW.SMART_TABLE_COLUMNS.';
		
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				getTranslate('COUNTRY'),
				getTranslate('CITY'),
				getTranslate('STREET_ADDRESS'),
				getTranslate('HOUSE'),
				getTranslate('APARTMENT'),
				getTranslate('INVITE_CODE'),
				getTranslate('INVITED_DATE'),
				getTranslate('STATUS')
		)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe(
						([
							 country,
							 city,
							 streetAddress,
							 house,
							 apartment,
							 inviteCode,
							 invitedDate,
							 status,
						 ]) =>
						{
							this.settingsSmartTable = {
								selectMode: 'multi',
								add:        {
									addButtonContent:    '<i class="ion-md-add"></i>',
									createButtonContent:
									                     '<i class="ion-md-checkmark"></i>',
									cancelButtonContent: '<i class="ion-md-close"></i>',
									confirmCreate:       true,
								},
								edit:       {
									editButtonContent:   '<i class="ion-md-create"></i>',
									saveButtonContent:
									                     '<i class="ion-md-checkmark"></i>',
									cancelButtonContent: '<i class="ion-md-close"></i>',
									confirmSave:         true,
								},
								delete:     {
									deleteButtonContent: '<i class="ion-md-trash"></i>',
									confirmDelete:       true,
								},
								columns:    {
									country:     {
										title:  country,
										editor: {
											type:                    'custom',
											component:               CountryRenderComponent,
											onComponentInitFunction: (instance: CountryRenderComponent) =>
											                         {
												                         instance.locale = this.locale ?? 'en-US';
											                         },
										},
									},
									city:        { title: city },
									address:     { title: streetAddress },
									house:       { title: house },
									apartment:   { title: apartment },
									invitedDate: {
										title:           invitedDate,
										editable:        false,
										addable:         false,
										type:            'custom',
										renderComponent: InvitedDateComponent,
									},
									status:      {
										title:           status,
										class:           'text-center',
										filter:          false,
										editable:        false,
										addable:         false,
										type:            'custom',
										renderComponent: StatusComponent,
									},
								},
								pager:      {
									display: true,
									perPage,
								},
							};
						}
				);
	}
	
	private async _loadDataSmartTable(page = 1)
	{
		if(this.$invitesRequests)
		{
			await this.$invitesRequests.unsubscribe();
		}
		
		const loadData = async(invitesRequests: InviteRequest[]) =>
		{
			const invitesRequestsVM =
					      invitesRequests
							      .map((inviteRequest) =>
							           {
								           return {
									           country:
											           getDefaultCountryName(inviteRequest.geoLocation.countryId) ||
											           this.noInfoSign,
									           city:        inviteRequest.geoLocation.city || this.noInfoSign,
									           address:
											           inviteRequest.geoLocation.streetAddress ||
											           this.noInfoSign,
									           house:       inviteRequest.geoLocation.house || this.noInfoSign,
									           apartment:
											           inviteRequest.apartment.trim() || this.noInfoSign,
									           id:          inviteRequest.id,
									           geoLocation: inviteRequest.geoLocation,
									           invitedDate:
											           inviteRequest.invitedDate &&
											           new Date(
													           inviteRequest.invitedDate
											           ).toLocaleDateString() +
											           '\n' +
											           new Date(
													           inviteRequest.invitedDate
											           ).toLocaleTimeString(),
									           isInvited:   inviteRequest.isInvited,
									           inviteRequest,
								           };
							           });
			
			await this.loadDataCount();
			
			const invitesRequestsData = new Array(this.dataCount);
			
			invitesRequestsData.splice(
					perPage * (page - 1),
					perPage,
					...invitesRequestsVM
			);
			
			await this.sourceSmartTable.load(invitesRequestsData);
		};
		
		this.loading = true;
		
		// We call two times 'loadData'
		// This is need because in every change on one of them the server emit and we want to receive it
		this.$invitesRequests = this._invitesRequestsService
		                            .getInvitesRequests(
				                            {
					                            skip:  perPage * (page - 1),
					                            limit: perPage,
				                            },
				                            !this.notInvitedOnly
		                            )
		                            .pipe(takeUntil(this.ngDestroy$))
		                            .subscribe(async(i: InviteRequest[]) =>
		                                       {
			                                       await loadData(i);
			                                       this.loading = false;
		                                       });
	}
	
	private getInviteCreateObject(data): IInviteCreateObject
	{
		data.apartment =
				data.apartment !== this.noInfoSign ? data.apartment : ' ';
		
		const geoLocation: IGeoLocationCreateObject = {
			countryId:     Object.values(countries).indexOf(data.country),
			city:          data.city,
			streetAddress: data.address,
			house:         data.house,
			loc:           {
				coordinates: data.geoLocation.loc.coordinates,
				type:        'Point',
			},
		};
		
		return {
			apartment: data.apartment,
			geoLocation,
		};
	}
	
	private async smartTableChange()
	{
		this.sourceSmartTable
		    .onChanged()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(async(event) =>
		               {
			               if(event.action === 'page')
			               {
				               const page = event.paging.page;
				               this.currentPage = page;
				               this._loadDataSmartTable(page);
			               }
		               });
	}
	
	private async loadDataCount()
	{
		this.dataCount = await this._invitesRequestsService.getCountOfInvitesRequests(
				!this.notInvitedOnly
		);
	}
	
	private static inviteRequestCreateObject(data: any)
	{
		InvitesRequestsComponent.inviteRequestValidation(data);
		data.apartment = data.apartment || ' ';
		return data;
	}
	
	private static inviteRequestValidation(data: any)
	{
		if(!data.address || !data.city || !data.country || !data.house)
		{
			throw new Error('Validation error');
		}
	}
}
