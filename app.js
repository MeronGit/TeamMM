
let validators = {};

validators["firstName"] = validators["lastName"] = validators["city"] = validators["street"] =
validators["country"] = validators["cityContact"] = validators["streetContact"] =
validators["countryContact"] = validators["ihFirstName"] = validators["ihLastName"] = function(field) {
    if (field.value.length < 2)
        return "Vähemalt 2 tähemärki";
};
validators["personalCode"] = validators["ihPersonalCode"] = function(field) {
    let value = field.value;
    if (value.trim().length != 11 || isNaN(value) || value <= 0)
        return "Eesti isikukoodis on 11 numbrit";
};

validators["email"] = function(field) {
    if (field.value.trim().length <= 0) {
        return "Sisesta e-postiaadress";
    } else if (!field.validity.valid) {
        return "Ebakorrektne e-postiaadress";
    }
};
validators["phoneNumber"] = function(field) {
    let value = field.value.replace(/\s+/g, "");
    if (value.length == 0) {
        return "Sisesta telefoninumber"
    } else if (!value.match(/^\+?\d+$/)) {
        return "Ebakorrektne telefoninumber";
    }
};
validators["arrivalSourceAddress"] = function(field) {
    if (!vm.showArrivalRow) {
        return "";
    }
    let parts = field.value.split(",");
    if (parts.length < 2 || parts[0].trim().length < 2
                || parts[1].trim().length < 2) {
        return "Ebakorrektne aadress";
    }
};
validators["arrivalDate"] = validators["startDate"] = validators["endDate"] = function(field) {
    if (!vm.showArrivalRow) {
        return "";
    }
    //kas siia peaks kirjutama ka if !vm.showFutureContactDate ja !vm.showEndContactDate?
    //või teha teine funktsioon?
    console.log("validating arrivalDate");
    if (!field.validity.valid) {
        return "Ebakorrektne kuupäev";
    } else if (field.value.trim().length == 0) {
        return "Sisesta kuupäev";
    }
};

//vb saab neid ka paremini teha iga numbri jaoks
validators["county"] = validators["countyContact"] = function(field) {
    if (field.value.length < 4)
        return "Vähemalt 4 tähemärki";
}
validators["postalCode"] = validators["postalCodeContact"] = function(field) {
    if (field.value.length < 3)
        return "Vähemalt 3 tähemärki";
}

let fieldsByStep = {
    0: ["firstName", "lastName", "personalCode", "email", "phoneNumber",
        "arrivalSourceAddress", "arrivalDate"],
    1: ["country", "county", "city", "street", "postalCode"],
    2: ["countryContact", "countyContact", "cityContact", "streetContact",
        "postalCodeContact", "startDate", "endDate"],
};

var vm = new Vue({
    el: "#app",
    data() {
        let obj = {
            stepNo: -1,
            numSteps: document.getElementsByClassName("stepDiv").length,

            // PAGE 0
            fillSource: "",
            identityEditable: true,
            phoneNumberEditable: true,
            foreignPersonalCode: "",
            showArrivalRow: false,
            showEndContactDate: false,
            showFutureContactDate: false,
            errors: [],

            // PAGE 1
            additionalAddressPresent: false,

            // PAGE 2
            permission: "",
            leaseContractFile: "",

            // PAGE 3
            inhabitantsIncludeMe: true,
            inhabitants: [],
            inhabitantFormShown: false,
            inhabitantFormVerb: "",
            inhabitantIndex: -1,
            //ihLastName: "",
            //ihPersonalCode: "",
            ihForeignPersonalCode: "",
            ihEmail: "",
            ihPhoneNumber: "",
            ihShowArrivalRow: false,
            ihArrivalSourceAddress: "",
            ihArrivalDate: ""
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
            /*this[field.id + "Invalid"] = false;
            this[field.id + "Msg"] = "";*/
            this.arrivalDateInvalid = false;
            this.arrivalDateMsg = "";
        },
        validateStep() {
            let fieldsToValidate = fieldsByStep[this.stepNo];
            if (!fieldsToValidate) {
                return true;
            }
            let allValid = true;
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
        revertFieldFill(event) {
            this.fillSource = "";
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
        removeInhabitant(index) {
            this.inhabitants.splice(index, 1);
        },
        showInhabitantForm(index) {
            this.inhabitantFormShown = true;
            this.inhabitantIndex = index;
            if (index == -1) {
                this.inhabitantFormVerb = "Lisa";
                this.ihFirstName = this.ihLastName = this.ihPersonalCode =
                this.ihForeignPersonalCode = this.ihEmail = this.ihPhoneNumber =
                this.ihArrivalSourceAddress = this.ihArrivalDate = "";
                this.ihShowArrivalRow = false;
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
            }
        },
        cancelInhabitantForm() {
            this.inhabitantFormShown = false;
        },
        submitInhabitantForm() {
            let inhabitant = {
                firstName: this.ihFirstName,
                lastName: this.ihLastName,
                personalCode: this.ihPersonalCode,
                foreignPersonalCode: this.ihForeignPersonalCode,
                email: this.ihEmail,
                phoneNumber: this.ihPhoneNumber,
                arrivalSourceAddress: this.ihArrivalSourceAddress,
                arrivalDate: this.ihArrivalDate
            };
            if (this.inhabitantIndex != -1) {
                this.inhabitants.splice(this.inhabitantIndex, 1, inhabitant);
            } else {
                this.inhabitants.push(inhabitant);
            }
            this.inhabitantFormShown = false;
        }
    }
});

document.body.className = "";
