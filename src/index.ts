import { CovinScrapperService } from './lib/covin-scrapper.service';

(async () => await main())();

async function main() {
  const cowinUrl = 'https://selfregistration.cowin.gov.in/';
  const scrapper = new CovinScrapperService(cowinUrl);
  try {
    await scrapper.initialize();
    await scrapper.restart();
  } catch (error) {
    console.log(error);
  }
}
