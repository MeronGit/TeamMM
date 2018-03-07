
let validators = {};

validators["firstName"] = validators["lastName"] = validators["city"] = validators["street"] =
validators["county"] = validators["country"] = validators["contactCity"] = validators["contactStreet"] =
validators["contactCounty"] = validators["contactCountry"] = validators["postalCode"] =
validators["contactPostalCode"] = validators["ihFirstName"] =  validators["ihLastName"] = function(field) {
    if (field.value.trim().length < 2)
        return "Vähemalt 2 tähemärki";
};
validators["personalCode"] = validators["ihPersonalCode"] = function(field) {
    let value = field.value;
    if (value.trim().length != 11 || isNaN(value) || value <= 0)
        return "Eesti isikukoodis on 11 numbrit";
};
validators["email"] = validators["ihEmail"] = function(field) {
    if (field.value.trim().length <= 0) {
        return "Sisesta e-postiaadress";
    } else if (!field.validity.valid) {
        return "Ebakorrektne e-postiaadress";
    }
};
validators["phoneNumber"] = validators["ihPhoneNumber"] = function(field) {
    let value = field.value.replace(/\s+/g, "");
    if (value.length == 0) {
        return "Sisesta telefoninumber"
    } else if (!value.match(/^\+?\d+$/)) {
        return "Ebakorrektne telefoninumber";
    }
};
validators["arrivalSourceAddress"] = validators["ihArrivalSourceAddress"] = function(field) {
    if (vm.stepNo == 0 && !vm.showArrivalRow
            || vm.stepNo == 3 && vm.inhabitantFormShown && !vm.ihShowArrivalRow) {
        return "";
    }
    let parts = field.value.split(",");
    if (parts.length < 2 || parts[0].trim().length < 2
                || parts[1].trim().length < 2) {
        return "Sisesta riik, haldusüksus";
    }
};
validators["arrivalDate"] = validators["ihArrivalDate"] = validators["startContactDate"] =
validators["endContactDate"] = function(field) {
    if (vm.stepNo == 0 && !vm.showArrivalRow
            || vm.stepNo == 3 && vm.inhabitantFormShown && !vm.ihShowArrivalRow
            || vm.stepNo == 2 && !vm[field.id + "Shown"]) {
        return "";
    }
    if (!field.validity.valid) {
        return "Ebakorrektne kuupäev";
    } else if (field.value.trim().length == 0) {
        return "Sisesta kuupäev";
    }
};
validators["leaseContractFile"] = function(field) {
    if (vm.permission != 'underLease') {
        return "";
    }
    if (vm.leaseContractFile.trim().length < 6
            || !vm.leaseContractFile.trim().toLowerCase().endsWith(".bdoc")) {
        return "Sisesta allkirjastatud .bdoc dokument";
    }
};
validators["ownerEmail"] = function(field) {
    if (field.value.trim().length <= 0) {
        return "Sisesta omaniku e-postiaadress";
    } else if (!field.validity.valid) {
        return "Ebakorrektne omaniku e-postiaadress";
    }
}

let fieldsByStep = {
    0: ["firstName", "lastName", "personalCode", "email", "phoneNumber",
        "arrivalSourceAddress", "arrivalDate"],
    1: ["country", "county", "city", "street", "postalCode"],
    2: ["contactCountry", "contactCounty", "contactCity", "contactStreet",
        "contactPostalCode", "startContactDate", "endContactDate"],
    3: ["leaseContractFile", "ownerEmail"],
    "ihform": ["ihFirstName", "ihLastName", "ihPersonalCode", "ihEmail", "ihPhoneNumber",
        "ihArrivalSourceAddress", "ihArrivalDate"],
};

var vm = new Vue({
    el: "#app",
    data() {
        let obj = {
            stepNo: -1,
            numSteps: document.getElementsByClassName("stepDiv").length,

            // STEP 0
            fillSource: "",
            confirmRevert: false,
            identityEditable: true,
            phoneNumberEditable: true,
            foreignPersonalCode: "",
            showArrivalRow: false,
            showOptionalDataField: false,
            nationality: "",
            motherTongue: "",
            education: "",
            socialStatus: "",
            errors: [],

            // STEP 1
            additionalAddressPresent: false,

            // STEP 3
            permission: "",
            permissionMsg: "",
            leaseContractFile: "",
            startContactDateShown: false,
            endContactDateShown: false,

            // STEP 4
            inhabitantsIncludeMe: true,
            inhabitants: [],
            inhabitantsMsg: "",
            inhabitantFormShown: false,
            inhabitantFormVerb: "",
            inhabitantIndex: -1,
            ihForeignPersonalCode: "",
            ihShowArrivalRow: false,
            ihArrivalSourceAddress: "",
            ihArrivalDate: "",
            ihShowOptionalDataField: false,
            ihNationality: "",
            ihMotherTongue: "",
            ihEducation: "",
            ihSocialStatus: ""
        };

        for (let fieldName in validators) {
            if (validators.hasOwnProperty(fieldName)) {
                obj[fieldName] = "";
                obj[fieldName + "Msg"] = "";
                obj[fieldName + "Invalid"] = false;
            }
        }

        return obj;
    },
    computed: {
        completionPercentage() {
            if (this.numSteps == 0) {
                return 0;
            } else {
                return Math.floor(this.stepNo / this.numSteps * 100);
            }
        }
    },
    methods: {
        validateField(field, onlyClear=false) {
            if (!field || !validators[field.id]) {
                return true;
            }
            let msg = validators[field.id](field);
            if (onlyClear) {
                this[field.id + "Invalid"] = false;
                if (!msg) {
                    this[field.id + "Msg"] = "";
                }
            } else {
                this[field.id + "Msg"] = msg || "";
            }
            return !msg;
        },
        clearFieldMessage(field) {
            if (!field) {
                return;
            }
            this[field.id + "Invalid"] = false;
            this[field.id + "Msg"] = "";
        },
        validateStep() {
            let fieldsToValidate;
            let allValid = true;
            if (this.stepNo == 3 && !this.permission) {
                this.permissionMsg = "Vali üks alljärgnevatest:";
                allValid = false;
            } else if (this.stepNo == 4) {
                if (this.inhabitantFormShown) {
                    fieldsToValidate = fieldsByStep["ihform"];
                } else if (!this.inhabitantsIncludeMe && this.inhabitants.length == 0) {
                    this.inhabitantsMsg = "Elukohateatis peab sisaldama vähemalt ühte elanikku";
                    allValid = false;
                }
            } else {
                fieldsToValidate = fieldsByStep[this.stepNo];
            }
            if (!fieldsToValidate || !allValid) {
                return allValid;
            }
            for (let fieldName of fieldsToValidate) {
                if (!this.validateField(document.getElementById(fieldName))) {
                    this[fieldName + "Invalid"] = true;
                    allValid = false;
                } else {
                    this[fieldName + "Invalid"] = false;
                }
            }
            return allValid;
        },
        goToPreviousStep(event) {
            if (this.stepNo > 0) {
                this.stepNo--;
                if (!this.additionalAddressPresent && this.stepNo == 2) {
                    this.stepNo--;
                }
            }
        },
        goToNextStep(event) {
            if (this.stepNo < this.numSteps) {
                if (!this.validateStep()) {
                    return;
                }
                this.stepNo++;
                if (!this.additionalAddressPresent && this.stepNo == 2) {
                    this.stepNo++;
                }
            }
        },
        goToNextStepDebug() {
            if (this.stepNo < this.numSteps) {
                this.stepNo++;
                if (!this.additionalAddressPresent && this.stepNo == 2) {
                    this.stepNo++;
                }
            }
        },

        // PAGE 0
        fillFieldsWithID(event) {
            this.firstName = "Jaagup";
            this.lastName = "Irve";
            this.personalCode = 38214569871;
            this.identityEditable = false;
            if (event.target.textContent == "Mobiil-ID") {
                this.phoneNumber = 55963214;
                this.phoneNumberEditable = false;
            }
            setTimeout(function () {
                for (fieldName of ["firstName", "lastName", "personalCode", "phoneNumber"]) {
                    vm.validateField(document.getElementById(fieldName), true);
                }
            }, 5);
            this.fillSource = event.target.textContent;
        },
        toggleConfirmRevert(event) {
            this.confirmRevert = !this.confirmRevert;
        },
        revertFieldFill(event) {
            this.confirmRevert = false;
            this.fillSource = "";
            this.firstName = this.lastName = this.personalCode = "";
            if (!this.phoneNumberEditable) {
                this.phoneNumber = "";
            }
            this.identityEditable = true;
            this.phoneNumberEditable = true;
        },

        // PAGE 3
        leaseContractFileChanged(event) {
            this.leaseContractFile = event.target.files[0].name;
        },

        // PAGE 4
        checkIfUnderage(fieldName){
            // check century https://dukelupus.wordpress.com/2010/04/05/eesti-isikukoodi-valideerimine-javascriptis/
            switch (fieldName.substr(0, 1)) {
                case '1':
                case '2':
                    {
                        century = 1800;
                        break;
                    }
                case '3':
                case '4':
                    {
                        century = 1900;
                        break;
                    }
                case '5':
                case '6':
                    {
                        century = 2000;
                        break;
                    }
                default:
                    {
                         return false;
                    }
            }
            var year = (century + new Number(fieldName.substr(1, 2)));
            var month = fieldName.substr(3, 2);
            var day = fieldName.substr(5, 2);
            var birth = new Date(year, month, day);

            var today = new Date();
            var dayToday = today.getDate();
            var monthToday = today.getMonth()+1; //January is 0!
            var yearToday = today.getFullYear();


            var age = yearToday - year;
            var monthDifference = monthToday - month;
            if (monthDifference  < 0 || (monthDifference  === 0 && dayToday < day)) {
                age--;
            }

            if (age < 18) return true;
            else return false;

        },
        toggleInhabitantDeleteConfirm(index) {
            Vue.set(this.inhabitants[index], "confirmDelete", !this.inhabitants[index].confirmDelete);
        },
        deleteInhabitant(index) {
            this.inhabitants.splice(index, 1);
        },
        showInhabitantForm(index) {
            this.inhabitantFormShown = true;
            this.inhabitantIndex = index;
            if (index == -1) {
                this.inhabitantFormVerb = "Lisa";
                this.ihFirstName = this.ihLastName = this.ihPersonalCode =
                this.ihForeignPersonalCode = this.ihEmail = this.ihPhoneNumber =
                this.ihArrivalSourceAddress = this.ihArrivalDate =
                this.ihNationality = this.ihMotherTongue =
                this.ihEducation = this.ihSocialStatus = "";
                this.ihShowArrivalRow = false;
                this.ihShowOptionalDataField = false;
            } else {
                this.inhabitantFormVerb = "Muuda";
                let ih = this.inhabitants[index];
                this.ihFirstName = ih.firstName;
                this.ihLastName = ih.lastName;
                this.ihPersonalCode = ih.personalCode;
                this.ihForeignPersonalCode = ih.foreignPersonalCode;
                this.ihEmail = ih.email;
                this.ihPhoneNumber = ih.phoneNumber;
                this.ihArrivalSourceAddress = ih.arrivalSourceAddress;
                this.ihArrivalDate = ih.arrivalDate;
                this.ihShowArrivalRow = !!(ih.arrivalSourceAddress || ih.arrivalDate);
                //?? pole kindel..
                this.ihNationality = ih.nationality;
                this.ihMotherTongue = ih.motherTongue;
                this.ihEducation = ih.education;
                this.ihSocialStatus = ih.socialStatus;
                this.ihShowOptionalDataField = !!(ih.nationality || ih.motherTongue);
            }
        },
        cancelInhabitantForm() {
            for (fieldName of fieldsByStep["ihform"]) {
                this.clearFieldMessage(document.getElementById(fieldName));
            }
            this.inhabitantFormShown = false;
        },
        submitInhabitantForm() {
            if (!this.validateStep()) {
                return;
            }
            let inhabitant = {
                firstName: this.ihFirstName,
                lastName: this.ihLastName,
                personalCode: this.ihPersonalCode,
                foreignPersonalCode: this.ihForeignPersonalCode,
                email: this.ihEmail,
                phoneNumber: this.ihPhoneNumber,
                arrivalSourceAddress: this.ihArrivalSourceAddress,
                arrivalDate: this.ihArrivalDate,
                nationality: this.ihNationality,
                motherTongue: this.ihMotherTongue,
                education: this.ihEducation,
                socialStatus: this.ihSocialStatus
            };
            if (this.inhabitantIndex != -1) {
                this.inhabitants.splice(this.inhabitantIndex, 1, inhabitant);
            } else {
                this.inhabitants.push(inhabitant);
            }
            this.clearInhabitantsMsg();
            this.inhabitantFormShown = false;
        },
        clearInhabitantsMsg() {
            this.inhabitantsMsg = "";
        }
    }
});

document.body.className = "";
