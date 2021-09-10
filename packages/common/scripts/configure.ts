import { readdirSync, readFileSync, unlinkSync, writeFile } from 'fs';
import * as path                                            from "path";

const headerComment = "// Autogenerated file: File contents are read from\n"
                      + "// common/src/i18n folder files.\n"
                      + "// To add translation add json to mentioned folder\n"
                      + "// or add values to json file.";

function writeFiles(args: { dest: string; content: string; name?: string }[])
{
	for(const arg of args)
	{
		writeFile(
				arg.dest,
				arg.content,
				(err) =>
				{
					if(err)
					{
						console.log(err);
					}
					else
					{
						console.log(`Generated ${arg?.name} file: ${arg.dest}`);
					}
				});
	}
}

function removeFiles(filePaths: Array<string>)
{
	for(const filePath of filePaths)
	{
		unlinkSync(filePath);
	}
}

function readDirContent(relPath: string): string[]
{
	return readdirSync(path.resolve(__dirname, relPath));
}

function readFileContent(relPath: string): string
{
	return readFileSync(
			path.resolve(__dirname, relPath), { encoding: 'utf8' }
	);
}

function getCountries()
{
	const relPath = '../src/i18n/countries';
	let i18nFiles = readDirContent(relPath);
	let countries: string = "{";
	
	i18nFiles.forEach((file, index) =>
	                  {
		                  let content = readFileContent(`${relPath}/${file}`);
		                  content = content.slice(1, content.length - 2);
		
		                  if(content.endsWith("\n"))
		                  {
			                  content = content.slice(0, content.lastIndexOf('\n'));
		                  }
		
		                  countries += (index < i18nFiles.length - 1)
		                               ? content + ","
		                               : content;
	                  })
	
	countries += "\n}";
	return countries;
}

function getLanguages()
{
	const relPath = '../src/i18n/languages.json';
	let languages = readFileContent(relPath);
	
	if(languages.endsWith("\n"))
	{
		languages = languages.slice(0, languages.lastIndexOf("\n"));
	}
	
	return languages;
}

function getCurrencies()
{
	let currenciesStrObj = readFileContent('../src/i18n/currencies.json')
	
	if(currenciesStrObj.endsWith('\n'))
	{
		currenciesStrObj = currenciesStrObj.slice(0, currenciesStrObj.lastIndexOf("\n"));
	}
	
	return currenciesStrObj.endsWith('\n')
	       ? currenciesStrObj.slice(0, currenciesStrObj.lastIndexOf("\n"))
	       : currenciesStrObj;
}

const countriesFileContent = `${headerComment}
import Country from '../enums/Country';

export type TCountryName = string;

export const COUNTRIES = ${getCountries()};

export function getCountryName(locale: string, country: null): null;
export function getCountryName(locale: string, country: Country): string;
export function getCountryName(locale: string, country: Country | null): string | null;
export function getCountryName(locale: string, country: Country | null): string | null
{
	let countries = getCountries(locale);
	return countries[Country[country]] || null;
}

export function getDefaultCountryName(country: null): null;
export function getDefaultCountryName(country: Country): string;
export function getDefaultCountryName(country: Country | null): string | null;
export function getDefaultCountryName(country: Country | null): string | null
{
	let countries = getCountries('en-US');
	return countries[Country[country]] || null;
}

export function getCountries(locale: string = 'en-US'): object
{
	return COUNTRIES[locale];
}

export function countriesIdsToNamesArrayFn(lang: string = 'ru-RU'): {
	id: Country;
	name: TCountryName;
}[]
{
	return Object.keys(getCountries(lang))
	             .map((abbr) =>
	                  {
		                  return {
			                  id:   Country[abbr],
			                  name: getCountryName(lang, +Country[abbr])
		                  };
	                  })
	             .sort((c1, c2) =>
	                   {
		                   return c1.name.localeCompare(c2.name)
	                   }
	             );
}

export const countriesIdsToNamesArray = countriesIdsToNamesArrayFn();
export const countries = getCountries();
`;

const languagesFileContent = `${headerComment}

const LANGUAGES = ${getLanguages()};

export function getLanguage(locale: string = 'en-US'): string
{
\treturn LANGUAGES[locale];
}
`;

const currenciesFileContent = `${headerComment}

/**
 * Currency sign order
 * Order must be either 'before' or 'after'
 * for currency sign position, or 'none' to hide sign.
 * */
export type TCurrencySignOrder = "after" | "before" | "none";

/**
 * Type for currency data
 * */
export type TCurrencyData = {
	name: string;
	code: string;
	sign?: string;
	order?: TCurrencySignOrder;
}

const EUROZONE: string[] = [
	"AT", "BE", "DE", "GR", "IE", "ES",
	"IT", "CY", "LV", "LT", "MT", "NL",
	"PT", "SK", "SI", "FI", "FR", "EE"
]

const CURRENCIES: object =
${getCurrencies()};

/**
 * Utility for currency constants
 * For EURO it's countryAbbr must be 'EU'
 * @returns {TCurrencyData}
 */
export function getCurrency(countryAbbr: string = 'RU'): TCurrencyData
{
try
	{
		for(let zone of EUROZONE)
		{
			if(zone === countryAbbr)
			{
				countryAbbr = 'EU';
				break;
			}
		}
		
		return CURRENCIES[countryAbbr];
	} catch
	{}
}
`

const countriesDest: string = './src/data/countries.ts';
const languagesDest: string = './src/data/languages.ts';
const currenciesDest: string = './src/data/currencies.ts';

try
{
	removeFiles([
		            countriesDest,
		            languagesDest,
		            currenciesDest
	            ]);
} catch
{}

writeFiles([
	           { dest: countriesDest, content: countriesFileContent, name: "countries" },
	           { dest: languagesDest, content: languagesFileContent, name: "languages" },
	           { dest: currenciesDest, content: currenciesFileContent, name: "currencies" },
           ])
