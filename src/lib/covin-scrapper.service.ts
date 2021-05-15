import { Browser, BrowserContext, Page, webkit } from 'playwright-webkit';

import { askQuestion, setTimeoutPromise } from './user-input.service';

export class CovinScrapperService {
  private browser: Browser;
  private context: BrowserContext;
  private page: Page;

  private delhiDistricts = [
    {
      name: 'centralDelhi',
      selector:
        '#cdk-overlay-1 > .mat-select-panel-wrap > #mat-select-2-panel > #mat-option-37 > .mat-option-text',
    },
    {
      name: 'southDelhi',
      selector:
        '#cdk-overlay-1 > .mat-select-panel-wrap > #mat-select-2-panel > #mat-option-44 > .mat-option-text',
    },
    {
      name: 'southEastDelhi',
      selector:
        '#cdk-overlay-1 > .mat-select-panel-wrap > #mat-select-2-panel > #mat-option-45 > .mat-option-text',
    },
    {
      name: 'southWestDelhi',
      selector:
        '#cdk-overlay-1 > .mat-select-panel-wrap > #mat-select-2-panel > #mat-option-46 > .mat-option-text',
    },
  ];

  private districtSearchDisplay = 10 * 1000;
  private loopId: NodeJS.Timeout | null = null;

  constructor(public initialUrl: string) {}

  async initialize() {
    this.browser = await webkit.launch({ headless: false, slowMo: 100 });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async restart() {
    const page = this.page;
    const navigationPromise = page.waitForNavigation();
    // go to initial url
    await page.goto(this.initialUrl);
    await page.setViewportSize({ width: 1440, height: 766 });
    // wait for reload to complete
    await navigationPromise;
    try {
      await this.handleAuthentication(page);
      await this.selectRegisteredPersons(page);
      await this.selectSearchType(page);
      await this.selectState(page);
      await this.loopDistrictSearch(page);
      // await this.searchByDistrict(page);
      // await this.lookForAvailableSlots(page);
    } catch (error) {
      console.error(error);
    } finally {
      await this.browser.close();
    }
  }

  async handleAuthentication(page: Page) {
    // wait for phone input element
    await page.waitForSelector('.mat-form-field #mat-input-0');
    await page.click('.mat-form-field #mat-input-0');
    // enter phone number
    // const phoneNumber = '9652710937';
    const phoneNumber = '7838585468';
    await page.type('.mat-form-field #mat-input-0', phoneNumber);
    // click phone number submit
    await page.waitForSelector(
      '.login-block > .md > .col-padding > .covid-button-desktop > .next-btn'
    );
    await page.click(
      '.login-block > .md > .col-padding > .covid-button-desktop > .next-btn'
    );

    // wait for otp input element
    await page.waitForSelector(
      '.mat-main-field > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix'
    );
    await page.click(
      '.mat-main-field > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix'
    );
    // enter otp
    const otp = await askQuestion('Enter OTP');
    await page.type('.mat-form-field #mat-input-1', otp);
    // click otp submit
    await page.waitForSelector(
      '.ng-dirty > .md > .md > .covid-button-desktop > .next-btn'
    );
    await page.click(
      '.ng-dirty > .md > .md > .covid-button-desktop > .next-btn'
    );
  }

  async selectRegisteredPersons(page: Page) {
    // ideally we should be on schedule page now
    // and need to select
    await page.waitForSelector(
      '.sepreetor:nth-child(2) > .md > .cardblockcls > .dose-data > .md > .btnlist > .bordernone > a > .calcls'
    );
    await page.click(
      '.sepreetor:nth-child(2) > .md > .cardblockcls > .dose-data > .md > .btnlist > .bordernone > a > .calcls'
    );

    // await page.waitForSelector(
    //   '.md > .schedule-btn-bg > .col-f > .covid-button-desktop > .register-btn'
    // );
    // await page.click(
    //   '.md > .schedule-btn-bg > .col-f > .covid-button-desktop > .register-btn'
    // );
  }

  async selectSearchType(page: Page) {
    // select 'district' search
    await page.waitForSelector(
      '.md > .md > .custom-checkbox > label > .status-switch'
    );
    await page.click('.md > .md > .custom-checkbox > label > .status-switch');
  }

  async selectState(page: Page) {
    // open state dropdown
    await page.waitForSelector(
      '.mat-form-field-infix > #mat-select-0 > .mat-select-trigger > #mat-select-value-1 > .mat-select-placeholder'
    );
    await page.click(
      '.mat-form-field-infix > #mat-select-0 > .mat-select-trigger > #mat-select-value-1 > .mat-select-placeholder'
    );

    // select 'delhi' state
    await page.waitForSelector(
      '#cdk-overlay-0 > .mat-select-panel-wrap > #mat-select-0-panel > #mat-option-9 > .mat-option-text'
    );
    await page.click(
      '#cdk-overlay-0 > .mat-select-panel-wrap > #mat-select-0-panel > #mat-option-9 > .mat-option-text'
    );
  }

  async searchByDistrict(page: Page, districtSelector: string) {
    // open district dropdown
    await page.waitForSelector(
      '.col-space-mobile > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix'
    );
    await page.click(
      '.col-space-mobile > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix'
    );

    // select passed district
    await page.waitForSelector(districtSelector);
    await page.click(districtSelector);

    // click slot search button
    await page.waitForSelector(
      '.md > .col-padding > .md > .ion-text-start > .pin-search-btn'
    );
    await page.click(
      '.md > .col-padding > .md > .ion-text-start > .pin-search-btn'
    );

    // click 18-44 age filter filter button
    await page.waitForSelector(
      '.md > .md > .agefilterblock > .form-check:nth-child(1) > label'
    );
    await page.click(
      '.md > .md > .agefilterblock > .form-check:nth-child(1) > label'
    );
  }

  async lookForAvailableSlots(page: Page) {
    console.log('looking for slots');
    return await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const document = window.document;
      const anchors = document.querySelectorAll(
        '#main-content > app-appointment-table ion-col.slot-available-main > ul > li div.slots-box > div.vaccine-box > a'
      );
      const anchorElements = [];
      anchors.forEach((element) => {
        anchorElements.push(element.innerHTML);
      });
      const availableCount = anchorElements.reduce((acc, text) => {
        const parsed = +text;
        if (!isNaN(parsed)) {
          acc += parsed;
        }
        return acc;
      }, 0);
      return availableCount;
    });
  }

  async loopDistrictSearch(
    page: Page,
    districtCounter = 0,
    districts = this.delhiDistricts
  ) {
    if (!districts.length) {
      return Promise.resolve(0);
    }
    if (this.loopId) {
      clearTimeout(this.loopId);
      this.loopId = null;
    }
    districtCounter = districtCounter % districts.length;
    const district = districts[districtCounter];
    await this.searchByDistrict(page, district.selector);
    const available = await this.lookForAvailableSlots(page);
    console.log(`available - ${available} - ${district.name}`);
    const result = await setTimeoutPromise(this.districtSearchDisplay, () =>
      this.loopDistrictSearch(page, districtCounter + 1, districts)
    );
    this.loopId = result.handle;
    return result.promise;
  }
}
