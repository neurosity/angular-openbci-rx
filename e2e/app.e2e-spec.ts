import { AngularTimerseriesPage } from './app.po';

describe('angular-timerseries App', () => {
  let page: AngularTimerseriesPage;

  beforeEach(() => {
    page = new AngularTimerseriesPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
