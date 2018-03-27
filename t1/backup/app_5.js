
var vm = new Vue({
    el: "#app",
    data: {
        stepNo: -1,
        numSteps: document.getElementsByClassName("stepDiv").length,

        // PAGE 0
        showArrivalRow: false,
        firstName: "",
        lastName: "",
        personalCode: "",
        phoneNumber: "",

        // PAGE 2
        permission: "",
        leaseContractFile: ""
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
            }
        },
        goToNextStep() {
            if (this.stepNo < this.numSteps) {
                this.stepNo++;
            }
        },
        fillFieldsWithID(mobile) {
            this.firstName = "Jaagup";
            this.lastName = "Irve";
            this.personalCode = 38214569871;
            if (mobile) {
                this.phoneNumber = 55963214;
            } else {
                this.phoneNumber = "";
            }
        },
        leaseContractFileChanged(target) {
            this.leaseContractFile = target.files[0].name;
        }
    }
});
