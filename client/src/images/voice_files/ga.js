(function() {
  var Clearbit, providePlugin,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  providePlugin = function(pluginName, pluginConstructor) {
    var tryApply = function() {
      var ga = window[window['GoogleAnalyticsObject'] || 'ga'];

      if (typeof ga === 'function') {
        ga('provide', pluginName, pluginConstructor);
        return true;
      } else {
        return false;
      }
    }

    if (tryApply()) {
      // Native support
    } else if (window.analytics && typeof window.analytics.ready === 'function') {
      // Segment support
      analytics.ready(tryApply);
    } else {
      console.error("Clearbit error: 'ga' variable not found.");
    }
  };

  Clearbit = (function() {
    function Clearbit(tracker, config) {
      this.tracker = tracker;
      this.config = config != null ? config : {};
      this.triggerEvent = bind(this.triggerEvent, this);
      this.setDimensions = bind(this.setDimensions, this);
      this.set = bind(this.set, this);
      this.done = bind(this.done, this);
      this.mapping = this.config.mapping || {};
      this.done({"ip":"216.30.179.54","domain":"willowtreeapps.com","fuzzy":true,"company":{"id":"caf1c416-d82c-4b5a-841a-0763e41322c1","name":"WillowTree","legalName":"WillowTree Inc","domain":"willowtreeapps.com","domainAliases":[],"url":"http://willowtreeapps.com","site":{"url":"http://willowtreeapps.com","title":"WillowTree | Mobile Application Development Company","h1":"the mobileinnovation agency","metaDescription":"Top iOS iPhone, Android, mobile \u0026 web application development company in the USA. We provide the best mobile app strategy, design \u0026 development. Contact us today.","metaAuthor":null,"phoneNumbers":["+1 888-329-9875","+1 434-326-5320","+1 919-230-4096","+1 212-520-0969"],"emailAddresses":["info@willowtreeapps.com","support@willowtreeapps.com"]},"category":{"sector":"Information Technology","industryGroup":"Technology Hardware \u0026 Equipment","industry":"Communications Equipment","subIndustry":"Computer Networking","sicCode":"36","naicsCode":"54"},"tags":["Mobile","B2B","SAAS","Networking","Information Technology \u0026 Services","Technology","Enterprise","Consulting \u0026 Professional Services"],"description":"Top iOS iPhone, Android, mobile \u0026 web application development company in the USA. We provide the best mobile app strategy, design \u0026 development. Contact us today.","foundedYear":2007,"location":"107 5th St SE, Charlottesville, VA 22902, USA","timeZone":"America/New_York","utcOffset":-4,"geo":{"streetNumber":"107","streetName":"5th Street Southeast","subPremise":null,"city":"Charlottesville","postalCode":"22902","state":"Virginia","stateCode":"VA","country":"United States","countryCode":"US","lat":38.029413,"lng":-78.47880030000002},"logo":"https://logo.clearbit.com/willowtreeapps.com","facebook":{"handle":"willowtreeapps"},"linkedin":{"handle":"company/willowtree-apps-inc"},"twitter":{"handle":"willowtreeapps","id":"17902122","bio":"The Mobile Agency","followers":2222,"following":729,"location":"Charlottesville, VA","site":"http://t.co/RcsPM2lh9Y","avatar":"https://pbs.twimg.com/profile_images/879110255673839617/GELh_3um_normal.jpg"},"crunchbase":{"handle":"organization/willowtree-apps"},"emailProvider":false,"type":"private","ticker":null,"phone":"+1 888-329-9875","metrics":{"alexaUsRank":58601,"alexaGlobalRank":192540,"employees":250,"employeesRange":"51-250","marketCap":null,"raised":null,"annualRevenue":null,"estimatedAnnualRevenue":"$10M-$50M","fiscalYearEnd":null},"tech":["typeform","pardot","google_analytics","google_tag_manager","mailchimp","google_apps","heroku","dns_made_easy","hotjar","bugsnag","facebook_advertiser","inspectlet"],"parent":{"domain":null}}});
    }

    Clearbit.prototype.done = function(response) {
      if (!(response != null ? response.company : void 0)) {
        return;
      }
      this.setDimensions(response.company);
      return this.triggerEvent(response.company);
    };

    Clearbit.prototype.set = function(key, value) {
      if (key && value) {
        return this.tracker.set(key, value);
      }
    };

    Clearbit.prototype.setDimensions = function(company) {
      var ref, ref1;
      this.set(this.mapping.companyName, company.name);
      this.set(this.mapping.companyDomain, company.domain);
      this.set(this.mapping.companyType, company.type);
      this.set(this.mapping.companyTags, (ref = company.tags) != null ? ref.join(',') : void 0);
      this.set(this.mapping.companyTech, (ref1 = company.tech) != null ? ref1.join(',') : void 0);
      this.set(this.mapping.companySector, company.category.sector);
      this.set(this.mapping.companyIndustryGroup, company.category.industryGroup);
      this.set(this.mapping.companyIndustry, company.category.industry);
      this.set(this.mapping.companySubIndustry, company.category.subIndustry);
      this.set(this.mapping.companySicCode, company.category.sicCode);
      this.set(this.mapping.companyNaicsCode, company.category.naicsCode);
      this.set(this.mapping.companyCountry, company.geo.countryCode);
      this.set(this.mapping.companyState, company.geo.stateCode);
      this.set(this.mapping.companyCity, company.geo.city);
      this.set(this.mapping.companyFunding, company.metrics.raised);
      this.set(this.mapping.companyEstimatedAnnualRevenue, company.metrics.estimatedAnnualRevenue);
      this.set(this.mapping.companyEmployeesRange, company.metrics.employeesRange);
      this.set(this.mapping.companyEmployees, company.metrics.employees);
      return this.set(this.mapping.companyAlexaRank, company.metrics.alexaGlobalRank);
    };

    Clearbit.prototype.triggerEvent = function(company) {
      return this.tracker.send(
        'event',
        'Clearbit',
        'Enriched',
        'Clearbit Enriched',
        {nonInteraction: true}
      );
    };

    return Clearbit;

  })();

  providePlugin('Clearbit', Clearbit);

  

  

}).call(this);
