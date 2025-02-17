"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.HomeComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var operators_1 = require("rxjs/operators");
var faSearch_1 = require("@fortawesome/free-solid-svg-icons/faSearch");
var launch_darkly_service_1 = require("src/app/services/launch-darkly/launch-darkly.service");
var featureFlags_1 = require("src/app/services/launch-darkly/featureFlags");
var HomeComponent = /** @class */ (function () {
    function HomeComponent(formBuilder, searchService, chainData, title) {
        var _this = this;
        this.formBuilder = formBuilder;
        this.searchService = searchService;
        this.chainData = chainData;
        this.title = title;
        this.faSearch = faSearch_1.faSearch;
        this.placeholders = [
            'Search by account name...',
            'Search by transaction id...',
            'Search by asset id...',
        ];
        this.err = '';
        this.currentPlaceholder = 0;
        this.searchForm = this.formBuilder.group({
            search_field: ['', forms_1.Validators.required]
        });
        this.filteredAccounts = [];
        this.searchPlaceholder = this.placeholders[0];
        this.featureFlagClient = new launch_darkly_service_1.LaunchDarklyService();
        setInterval(function () {
            _this.currentPlaceholder++;
            if (!_this.placeholders[_this.currentPlaceholder]) {
                _this.currentPlaceholder = 0;
            }
            _this.searchPlaceholder = _this.placeholders[_this.currentPlaceholder];
        }, 2000);
    }
    HomeComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.searchForm.get('search_field').valueChanges.pipe((0, operators_1.debounceTime)(300)).subscribe(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = this;
                                        return [4 /*yield*/, this.searchService.filterAccountNames(result)];
                                    case 1:
                                        _a.filteredAccounts = _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        if (this.chainData.chainInfoData.chain_name) {
                            this.title.setTitle("".concat(this.chainData.chainInfoData.chain_name, " Hyperion Explorer"));
                        }
                        _a = this;
                        return [4 /*yield*/, this.featureFlagClient.variation(featureFlags_1.FeatureFlagName.IsQueryingByBlockNumberEnabled)];
                    case 1:
                        _a.isQueryingByBlockNumberEnabled =
                            _b.sent();
                        if (this.isQueryingByBlockNumberEnabled) {
                            this.placeholders.push('Search by block number...');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    HomeComponent.prototype.submit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var searchText, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.searchForm.valid) {
                            return [2 /*return*/];
                        }
                        searchText = this.searchForm.get('search_field').value;
                        this.searchForm.reset();
                        return [4 /*yield*/, this.searchService.submitSearch(searchText, this.filteredAccounts)];
                    case 1:
                        status = _a.sent();
                        if (!status && !isNaN(searchText)) {
                            this.err = 'cannot search block numbers ';
                        }
                        else if (!status) {
                            this.err = 'no results for ' + searchText;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    HomeComponent = __decorate([
        (0, core_1.Component)({
            selector: 'app-home',
            templateUrl: './home.component.html',
            styleUrls: ['./home.component.css']
        })
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
