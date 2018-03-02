
var vm = new Vue({
    el: "#app",
    data: {
        stepNo: -1,
        numSteps: document.getElementsByClassName("stepDiv").length,

        // PAGE 0
        fillSource: "",
        identityEditable: true,
        phoneNumberEditable: true,
        firstName: "",
        lastName: "",
        personalCode: "",
        foreignPersonalCode: "",
        email: "",
        phoneNumber: "",
        showArrivalRow: false,
        arrivalSourceAddress: "",
        arrivalDate: "",
        firstNameInvalid: false,
        emailInvalid: false,
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
        ihFirstName: "",
        ihLastName: "",
        ihPersonalCode: "",
        ihForeignPersonalCode: "",
        ihEmail: "",
        ihPhoneNumber: "",
        ihShowArrivalRow: false,
        ihArrivalSourceAddress: "",
        ihArrivalDate: ""
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
        goToPreviousStep() {
            if (this.stepNo > 0) {
                this.stepNo--;
                if (!this.additionalAddressPresent && this.stepNo == 2) {
                    this.stepNo--;
                }
            }
        },
        goToNextStep() {
            if (this.stepNo < this.numSteps) {
                this.stepNo++;
                if (!this.additionalAddressPresent && this.stepNo == 2) {
                    this.stepNo++;
                }
            }
        },
        fillFieldsWithID(event) {
            this.firstName = "Jaagup";
            this.lastName = "Irve";
            this.personalCode = 38214569871;
            this.identityEditable = false;
            if (event.target.textContent == "Mobiil-ID") {
                this.phoneNumber = 55963214;
                this.phoneNumberEditable = false;
            }
            this.fillSource = event.target.textContent;
        },
        revertFieldFill(event) {
            this.fillSource = "";
            this.identityEditable = true;
            this.phoneNumberEditable = true;
        },

        // PAGE 0
        checkEmptyMandatoryFields: function(e) {
            if (!this.firstName.trim() || !this.lastName.trim() || !this.personalCode || !this.email.trim() || !this.phoneNumber) {
                this.errors = [];
                this.errors.push("Palun täida kohustuslikud väljad");

                this.firstNameInvalid = !this.firstName.trim();
                this.emailInvalid = !this.email.trim();
            } else {
                this.goToNextStep();
            }
        },

        // PAGE 2
        leaseContractFileChanged(target) {
            this.leaseContractFile = target.files[0].name;
        },

        // PAGE 3
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
