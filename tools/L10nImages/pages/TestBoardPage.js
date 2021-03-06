const { snakeCase } = require('snake-case');
const Page = require('./Page');

class TestBoardPage extends Page {
  constructor(browser) {
    super(browser, {
      closeCardButton: '.js-close-window',
      memberMenu: '.js-open-header-member-menu',
      changeLanguageMenuItem: '[data-test-id="header-member-menu-lang"]',
      memberMenuPopOver: '[data-test-id="header-member-menu-popover"]',
      cardBadgeVote: '.js-list:nth-child(1) > div',
      cardBadgeElapsed: '.js-list:nth-child(2) > div',
      cardBackSectionOngoing: '.js-plugin-card-back-sections',
      cardBackSectionPaused: '.js-plugin-card-back-sections',
      powerUpButtons: '.js-button-list',
      discussionButton: '.js-button-list > span:nth-child(1) > a',
      startOrPauseButton: '.pop-over-list.js-list > li:first-child',
      stopButton: '.pop-over-list.js-list > li:nth-child(2)'
    });
  }

  async isAvailable() {
    await this.browser.pause(500);
    await this.browser.waitUntil(
      async () => {
        const text = await (await this.browser.$(this.selectors.cardBadgeVote)).getText();
        return text.length > 'Life, the Universe and Everything'.length;
      },
      10000,
      'Expected powerup to be fully loaded after 10s'
    );
  }

  async open() {
    this.browser.url('https://trello.com/b/6FGJ2zCC/test-powerup');
    await this.isAvailable();
  }

  async switchLanguageTo(language) {
    const memberMenu = await this.browser.$(this.selectors.memberMenu);
    await memberMenu.click();

    const changeLanguageMenuItem = await this.browser.$(this.selectors.changeLanguageMenuItem);
    await changeLanguageMenuItem.click();

    const memberMenuPopOver = await this.browser.$(this.selectors.memberMenuPopOver);
    const desiredLanguageMenuItem = await memberMenuPopOver.$(`span=${language}`);
    await desiredLanguageMenuItem.click();

    await this.isAvailable();
  }

  async takeAllScreenshotsFor(languageCode, languageName) {
    this.logger.info({ label: languageCode, message: '┌ Initiating screenshots' });
    await this.switchLanguageTo(languageName);

    await this.hideAddCardButton();

    await this.saveScreenshotFor('cardBadgeVote', languageCode);
    await this.saveScreenshotFor('cardBadgeElapsed', languageCode);

    await this.clickOn('cardBadgeElapsed');
    await this.saveScreenshotFor('powerUpButtons', languageCode);

    await this.clickOn('discussionButton');
    await this.clickOn('startOrPauseButton');
    await this.saveScreenshotFor('cardBackSectionOngoing', languageCode);

    await this.clickOn('discussionButton');
    await this.clickOn('startOrPauseButton');
    await this.saveScreenshotFor('cardBackSectionPaused', languageCode);

    await this.clickOn('discussionButton');
    await this.clickOn('stopButton');
    await this.clickOn('closeCardButton');

    this.logger.info({
      label: languageCode,
      message: `└ Done - all assets saved in ./assets/listings/${languageCode}/\n`
    });
  }

  async hideAddCardButton() {
    return this.browser.executeScript(
      'document.querySelectorAll(".js-card-composer-container").forEach((button) => button.style.display = "none")', []
    );
  }

  async clickOn(selector) {
    const element = await this.browser.$(this.selectors[selector]);
    await element.click();
    await this.browser.pause(3000);
  }

  async saveScreenshotFor(elementName, languageCode) {
    this.logger.info({ label: languageCode, message: `├ Saving screenshot for ${elementName}` });
    const element = await this.browser.$(this.selectors[elementName]);
    await element.waitForDisplayed();

    await this.browser.pause(3000);
    await element.saveScreenshot(`./assets/listings/${languageCode}/${snakeCase(elementName)}.png`);
  }
}

module.exports = TestBoardPage;
