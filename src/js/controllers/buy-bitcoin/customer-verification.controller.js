'use strict';

(function () {

angular
  .module('bitcoincom.controllers')
  .controller('buyBitcoinCustomerVerificationController', buyBitcoinCustomerVerificationController);

  function buyBitcoinCustomerVerificationController(
    bitAnalyticsService
    , gettextCatalog
    , $ionicHistory
    , $log
    , kycFlowService
    , moonPayService
    , ongoingProcess
    , popupService
    , $scope
    ) {
    var vm = this;
    vm.countriesAreLoading = true;
    vm.country = '';
    vm.documentType = '';

    // Functions
    vm.onCountrySelect = onCountrySelect;
    vm.onStartPhotograph = onStartPhotograph;
    vm.onRestoreVerify = onRestoreVerify;

    vm.supportedDocumentLabels = {
      'passport': gettextCatalog.getString('Passport')
      ,'national_identity_card': gettextCatalog.getString('National ID')
      ,'driving_licence': gettextCatalog.getString('Driving License') // Check if Typo from Documentation persists
    }

    var currentState = {};

    function _initVariables() {
      vm.email = '';
      vm.countries = [];
      

      // Fetch Countries and Documents
      moonPayService.getAllCountries().then(
        function onGetAllCountriesSuccess(countries) {
          vm.countries = countries;
          vm.countriesAreLoading = false;
        },
        function onGetAllCountriesError(err) {
          console.log('Failed to get countries.', err);
          vm.countriesAreLoading = false;
        }
      );

      currentState = kycFlowService.getCurrentStateClone();
      // Apply current State
      vm.country = currentState.countryCode;
      vm.documentType = currentState.documentType;

    }

    $scope.$on("$ionicView.beforeEnter", onBeforeEnter);
    $scope.$on("$ionicView.beforeLeave", onBeforeLeave);

    function onCountrySelect() {
      if(!vm.country) {
        vm.supportedDocuments = [];
        vm.documentType = '';
        return;
      }
      
      // Set document Types
      for(var i=0; i < vm.countries.length; i++) {
        if( vm.countries[i]['code'] === vm.country ) {
          vm.supportedDocuments = vm.countries[i]['supportedDocuments']
          vm.documentType = vm.supportedDocuments[0];
          break;
        }
      }
    }

    function onStartPhotograph() {
      if (!vm.country || !vm.documentType) {
        console.log('Form incomplete.');
        return;
      }
      // Save current state
      currentState.countryCode = vm.country;
      currentState.documentType = vm.documentType;
      kycFlowService.nextGo(currentState);
    }
    
    function onRestoreVerify() {
      console.log('Restore Verification!');
    }

    function onBeforeEnter(event, data) {
      _initVariables();
      bitAnalyticsService.postEvent('buy_bitcoin_customer_verification_screen_open' ,[], ['leanplum']);
    }

    function onBeforeLeave(event, data) {
      _initVariables();
      bitAnalyticsService.postEvent('buy_bitcoin_customer_verification_screen_close' ,[], ['leanplum']);
    }
  }
})();
