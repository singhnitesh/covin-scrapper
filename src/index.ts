import { CovinScrapperService } from './lib/covin-scrapper.service';

(async () => await main())();

async function main() {
  const phoneNumber = '';
  if (!phoneNumber) {
    throw new Error('phone number required');
  }
  const personIndex = 2; // starts at 1
  const cowinUrl = 'https://selfregistration.cowin.gov.in/';
  const scrapper = new CovinScrapperService(cowinUrl, phoneNumber, personIndex);
  // try {
  await scrapper.initialize();
  await scrapper.restart();
  // } catch (error) {
  //   console.log(error);
  // }
}
