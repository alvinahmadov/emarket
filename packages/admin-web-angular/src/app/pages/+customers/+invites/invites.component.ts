// noinspection JSUnusedLocalSymbols

import { NgbModal }                                    from '@ng-bootstrap/ng-bootstrap';
import {
	AfterViewChecked,
	OnDestroy,
	OnInit,
	Component,
	ElementRef,
	Renderer2
}                                                      from '@angular/core';
import { TranslateService }                            from '@ngx-translate/core';
import { LocalDataSource }                             from 'ng2-smart-table';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { first, takeUntil }                            from 'rxjs/operators';
import { getCountryName }                              from '@modules/server.common/data/countries';
import { IInviteUpdateObject }                         from '@modules/server.common/interfaces/IInvite';
import { IGeolocationUpdateObject }                    from '@modules/server.common/interfaces/IGeoLocation';
import Country                                         from '@modules/server.common/enums/Country';
import Invite                                          from '@modules/server.common/entities/Invite';
import { InvitesService }                              from '@app/@core/data/invites.service';
import { StorageService }                              from '@app/@core/data/store.service';
import { NotifyService }                               from '@app/@core/services/notify/notify.service';
import { ConfimationModalComponent }                   from '@app/@shared/confirmation-modal/confirmation-modal.component';
import { CountryRenderComponent }                      from './country-render/country-render.component';

export interface InviteViewModel
{
	id: string;
	country: string;
	city: string;
	address: string;
	house: string;
	apartment: string;
	invite: string;
}

const perPage = 10;

@Component({
	           selector:    'ea-invites',
	           styleUrls:   ['/invites.component.scss'],
	           templateUrl: './invites.component.html',
           })
export class InvitesComponent implements OnInit, OnDestroy, AfterViewChecked
{
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	public loading: boolean;
	public locale: string;
	
	private ngDestroy$ = new Subject<void>();
	
	private noInfoSign = '';
	private selectedInvites: InviteViewModel[] = [];
	
	private addClick2: boolean;
	
	private dataCount: number;
	private $invites: Subscription;
	
	constructor(
			private readonly _invitesService: InvitesService,
			private readonly _storage: StorageService,
			private readonly _elRef: ElementRef,
			private readonly _renderer: Renderer2,
			private readonly _translateService: TranslateService,
			private readonly _notifyService: NotifyService,
			private readonly modalService: NgbModal
	)
	{}
	
	public get hasSelectedInvites(): boolean
	{
		return this.selectedInvites.length > 0;
	}
	
	public ngOnInit(): void
	{
		this.locale = this._storage.locale ?? 'en-US';
		this._loadSettingsSmartTable();
		this._loadDataSmartTable();
		this._applyTranslationOnSmartTable();
		this.smartTableChange();
	}
	
	public ngAfterViewChecked(): void
	{
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
			if(!this.addClick2 && tr.className !== 'ng-star-inserted')
			{
				this._renderer.insertBefore(tr, td, refChild);
				this.addClick2 = true;
			}
		}
		else
		{
			this.addClick2 = false;
		}
	}
	
	public ngOnDestroy(): void
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public selectInviteTmp(ev): void
	{
		this.selectedInvites = ev.selected;
	}
	
	public async createConfirm(e): Promise<void>
	{
		try
		{
			this.loading = true;
			const createDataObject = InvitesComponent.inviteCreateObject(e.newData);
			const createInput = await this._invitesService.getCreateInviteObject(
					createDataObject,
					this.locale
			);
			await this._invitesService
			          .createInvite(createInput)
			          .pipe(first())
			          .toPromise();
			e.confirm.resolve();
			this.loading = false;
			const message = `Invite was created`;
			this._notifyService.success(message);
		} catch(error)
		{
			let message = `Something went wrong`;
			if(error.message === 'Validation error')
			{
				message = error.message;
			}
			this.loading = false;
			this._notifyService.error(message);
		}
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
				                               this._invitesService
				                                   .removeByIds([e.data.id])
				                                   .pipe(first())
				                                   .toPromise();
				
				                               this.loading = false;
				                               const message = `Invite was deleted`;
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
			const createDataObject = InvitesComponent.inviteCreateObject(e.newData);
			const createInput = await this._invitesService.getCreateInviteObject(
					createDataObject
			);
			
			const res = await this._invitesService
			                      .updateInvite(e.data.id, createInput)
			                      .pipe(first())
			                      .toPromise();
			e.confirm.resolve(res);
			this.loading = false;
			const message = `Invite was updated`;
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
	}
	
	public async deleteSelectedRows(): Promise<void>
	{
		const idsForDelete: string[] = this.selectedInvites.map((c) => c.id);
		try
		{
			this.loading = true;
			await this._invitesService
			          .removeByIds(idsForDelete)
			          .pipe(first())
			          .toPromise();
			
			this.loading = false;
			const message = `${idsForDelete.length} invites was deleted`;
			this._notifyService.success(message);
			this.selectedInvites = [];
		} catch(error)
		{
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}
	
	private _applyTranslationOnSmartTable()
	{
		this._translateService.onLangChange.subscribe(() =>
		                                              {
			                                              this._loadSettingsSmartTable();
		                                              });
	}
	
	private _loadSettingsSmartTable()
	{
		const columnTitlePrefix = 'CUSTOMERS_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				this._translateService.get('Id'),
				getTranslate('CITY'),
				getTranslate('COUNTRY'),
				getTranslate('STREET_ADDRESS'),
				getTranslate('HOUSE'),
				getTranslate('APARTMENT'),
				getTranslate('INVITE_CODE')
		)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe(
						([
							 id,
							 city,
							 country,
							 streetAddress,
							 apartment,
							 house,
							 inviteCode,
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
									country:   {
										title:  country,
										editor: {
											type:      'custom',
											component: CountryRenderComponent,
										},
									},
									city:      { title: city },
									address:   { title: streetAddress },
									house:     { title: house },
									apartment: { title: apartment },
									invite:    { title: inviteCode },
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
		if(this.$invites)
		{
			await this.$invites.unsubscribe();
		}
		const loadData = async(invites: Invite[]) =>
		{
			const invitesVM = invites.map(
					(invite) =>
					{
						this.loading = false;
						
						return {
							country:     getCountryName(
									             this.locale,
									             invite.geoLocation.countryId
							             ) ||
							             this.noInfoSign,
							city:        invite.geoLocation.city.trim() || this.noInfoSign,
							address:     invite.geoLocation.streetAddress.trim() ||
							             this.noInfoSign,
							house:       invite.geoLocation.house.trim() || this.noInfoSign,
							apartment:   invite.apartment.trim() || this.noInfoSign,
							invite:      invite.code.trim() || this.noInfoSign,
							id:          invite.id,
							geoLocation: invite.geoLocation,
						};
					}
			);
			
			await this.loadDataCount();
			
			const invitesData = new Array(this.dataCount);
			
			invitesData.splice(perPage * (page - 1), perPage, ...invitesVM);
			
			await this.sourceSmartTable.load(invitesData);
		};
		
		// We call two times 'loadData'
		// This is need because in every change on one of them the server emit and we want to receive it
		this.loading = true;
		this.$invites = this._invitesService
		                    .getInvites({
			                                skip:  perPage * (page - 1),
			                                limit: perPage,
		                                })
		                    .pipe(takeUntil(this.ngDestroy$))
		                    .subscribe(async(invites: Invite[]) =>
		                               {
			                               this.loading = true;
			                               await loadData(invites);
			                               this.loading = false;
		                               });
	}
	
	private static getUpdateInviteObject(data: InviteViewModel): IInviteUpdateObject
	{
		const geoLocation: IGeolocationUpdateObject = {
			countryId:     Country[data.country],
			city:          data.city,
			streetAddress: data.address,
			house:         data.house,
		};
		
		return {
			code:      data.invite,
			apartment: data.apartment,
			geoLocation,
		};
	}
	
	private static inviteCreateObject(data: any): any
	{
		InvitesComponent.inviteValidation(data);
		data.apartment = data.apartment || ' ';
		return data;
	}
	
	private static inviteValidation(data: any): void
	{
		if(!data.address || !data.city || !data.country || !data.house)
		{
			throw new Error('Validation error');
		}
	}
	
	private async smartTableChange(): Promise<void>
	{
		this.sourceSmartTable
		    .onChanged()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(async(event) =>
		               {
			               if(event.action === 'page')
			               {
				               const page = event.paging.page;
				               await this._loadDataSmartTable(page);
			               }
		               });
	}
	
	private async loadDataCount(): Promise<void>
	{
		this.dataCount = await this._invitesService.getCountOfInvites();
	}
}
