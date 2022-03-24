"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlags = exports.FeatureFlagName = void 0;
var FeatureFlagName;
(function (FeatureFlagName) {
    FeatureFlagName["IsQueryingByBlockNumberEnabled"] = "is_querying_by_block_number_enabled";
    FeatureFlagName["IsQueryingTokenValueEnabled"] = "is_querying_token_value_enabled";
})(FeatureFlagName = exports.FeatureFlagName || (exports.FeatureFlagName = {}));
exports.featureFlags = {
    [FeatureFlagName.IsQueryingByBlockNumberEnabled]: { defaultValue: false },
    [FeatureFlagName.IsQueryingTokenValueEnabled]: { defaultValue: false },
};
//# sourceMappingURL=featureFlags.js.map