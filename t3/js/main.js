
Vue.component('points-label', {
    props: ['points', 'suffix'],
    template: `
        <span class="font-weight-normal"
            :class="{'text-success': points > 0, 'text-muted': points == 0, 'text-danger': points < 0}">
            <template v-if="points >= 0">+</template>{{ points }}{{ suffix }}</span>`
});

let vm = new Vue({
    el: "#app",
    data: {
        homeworkUrlState: "",
        lastCheckedHomeworkUrl: "",
        studentsState: "",
        deadline: new Date(2018, 3, 11),
        previousDeadline: null,
        originalDeadline: new Date(2018, 3, 11),
        previousSubmissions: [],
        basePointsFactors: [
            "Läbikukkumine, punktid, ja kordamine",
            "Tähelepanu juhitakse animatsioonidega",
            "Sortimine (lohistamine või klõps)",
            "Tähtajaline lisaülesanne",
            "Elude kaotamine",
            "Ootejärjekord",
        ],
        bonusPointsFactors: [
            "Ilus kujundus",
            "Mängu kujundus toetab teemat",
            "Head ilmumised",
            "Hea sortimise tagasiside",
            "Hea lisaülesande \"episood\"",
            "Hea läbikukkumiste tagasiside",
            "Heliline tagasiside",
            "Mängu õpitavus on hea",
            "Sorditavaid objekte saab lohistada",
            "Töötab ka mobiilil"
        ],
        selectedBasePointsFactors: [],
        selectedBonusPointsFactors: [],
        savedSubmissions: {
            "http://dijkstra.cs.ttu.ee/~mateek/ui/t3/": {
                students: ["Magnus Teekivi", "Merli Lall"],
                deadline: new Date(2018, 3, 25),
                previousSubmissions: [
                    {
                        date: new Date(2018, 3, 18),
                        points: 12
                    },
                    {
                        date: new Date(2018, 3, 11),
                        points: 8
                    }
                ],
                selectedBasePointsFactors: [
                    "Tähelepanu juhitakse animatsioonidega",
                    "Sortimine (lohistamine või klõps)",
                    "Tähtajaline lisaülesanne",
                    "Elude kaotamine",
                    "Ootejärjekord"
                ],
                selectedBonusPointsFactors: [
                    "Ilus kujundus",
                    "Head ilmumised",
                    "Heliline tagasiside",
                    "Mängu õpitavus on hea",
                ],
                factorNotes: {
                    "Ootejärjekord": "Eriti hästi tehtud!",
                    "Head ilmumised": "Ajastused olid küll aeglased, aga asja eest"
                },
                gracePoints: 10,
                additionalPoints: 4,
                additionalNotes: "Vaeva on nähtud"
            }
        },
        factorNotes: {},
        currentNoteFactorName: "",
        currentNote: "",
        gracePoints: 0,
        additionalPoints: 0,
        additionalNotes: "",
    },
    computed: {
        daysOverdue() {
            let now = new Date();
            return Math.floor((now - this.deadline)/(1000*60*60*24));
        },
        deadlinePointsPenalty() {
            let pointsPenalty = 0;
            if (this.daysOverdue <= 0) {
                pointsPenalty = 0;
            } else if (this.daysOverdue <= 7) {
                pointsPenalty = -2;
            } else {
                pointsPenalty = -5;
            }
            return pointsPenalty;
        },
        numBasePointsFactors() {
            return this.selectedBasePointsFactors.length;
        },
        numBasePoints() {
            if (this.numBasePointsFactors == 6) {
                return 10;
            } else if (this.numBasePointsFactors >= 4) {
                return this.gracePoints;
            } else {
                return 0;
            }
        },
        numBonusPoints() {
            let bonusPoints = this.selectedBonusPointsFactors.length;
            if (this.additionalPoints !== "") {
                bonusPoints += this.additionalPoints;
            }
            return bonusPoints;
        },
        numTotalPoints() {
            let points = this.deadlinePointsPenalty;
            if (this.numBasePoints > 0) {
                points += this.numBasePoints;
                points += this.numBonusPoints;
            }
            return points;
        },
        canSaveNote() {
            return this.currentNote.trim().length > 0;
        },
        pointsBarPercentage() {
            return Math.max(0, Math.min(100, (this.numTotalPoints / 20) * 100));
        },
        canPostpone() {
            return (this.homeworkUrlState == "no-plagiarism" ||
                        this.homeworkUrlState == "plagiarism") &&
                        this.studentsState == "correct";
        },
        canUndoPostpone() {
            return this.canPostpone && !!this.previousDeadline;
        },
        canSubmit() {
            return this.numTotalPoints >= 10 &&
                this.homeworkUrlState == "no-plagiarism" &&
                this.studentsState == "correct";
        }
    },
    methods: {
        resetForm() {
            for (let field of ["homeworkUrlState", "lastCheckedHomeworkUrl", "studentsState", "additionalNotes"]) {
                this[field] = "";
            }
            for (let field of ["previousSubmissions", "selectedBasePointsFactors", "selectedBonusPointsFactors"]) {
                this[field] = [];
            }
            this.deadline = new Date(2018, 3, 11);
            this.previousDeadline = null;
            this.factorNotes = {};
            this.gracePoints = this.additionalPoints = 0;
            this.$forceUpdate();
            $("#homeworkUrl").typeahead('val', '');
            $("#students").tagsinput('removeAll');
        },
        checkHomeworkUrl(event) {
            let homeworkUrl = $("#homeworkUrl").typeahead("val");
            if (!homeworkUrl.trim()) {
                this.homeworkUrlState = "empty";
            } else if (!event.target.validity.valid) {
                this.homeworkUrlState = "incorrect";
            } else {
                let timeout = 1000;
                if (homeworkUrl == this.lastCheckedHomeworkUrl) {
                    timeout = 0;
                } else {
                    this.lastCheckedHomeworkUrl = homeworkUrl;
                    this.homeworkUrlState = "loading";
                }
                let vm = this;
                setTimeout(function() {
                    if (vm.homeworkUrlState != "loading" && timeout != 0) {
                        return;
                    } else if (homeworkUrl.startsWith("http://dijkstra.cs.ttu.ee/~hacker/ui/t3")) {
                        vm.homeworkUrlState = "plagiarism";
                    } else {
                        vm.homeworkUrlState = "no-plagiarism";
                        let savedSubmission = vm.savedSubmissions[homeworkUrl];
                        if (savedSubmission) {
                            let fieldsToOverwrite = [
                                "deadline",
                                "previousSubmissions",
                                "selectedBasePointsFactors",
                                "selectedBonusPointsFactors",
                                "factorNotes",
                                "gracePoints",
                                "additionalPoints",
                                "additionalNotes"
                            ];
                            for (let fieldName of fieldsToOverwrite) {
                                vm[fieldName] = savedSubmission[fieldName];
                            }
                            $("#students").tagsinput("removeAll");
                            for (let student of savedSubmission.students) {
                                $("#students").tagsinput('add', student);
                            }
                        }
                    }
                }, timeout);
            }
        },
        resetHomeworkUrlState() {
            this.homeworkUrlState = "";
        },
        checkStudents(event) {
            if ($("#students").tagsinput("items").length == 0) {
                this.studentsState = "empty";
            } else {
                this.studentsState = "correct";
            }
        },
        formatDate(date, includeYear=false) {
            let options = {
                day: "numeric",
                month: "long",
            };
            if (includeYear) {
                options.year = "numeric";
            }
            return date.toLocaleDateString('et-EE', options);
        },
        daysSince(date) {
            let now = new Date();
            let diff = now - date;
            return Math.floor(diff/(1000*60*60*24));
        },
        onNoteButton(factor) {
            this.currentNoteFactorName = factor;
            this.currentNote = "";
            if (this.factorNotes[factor]) {
                this.currentNote = this.factorNotes[factor];
            }
        },
        onNoteSaveButton(event) {
            this.factorNotes[this.currentNoteFactorName] = this.currentNote;
            this.$forceUpdate();
        },
        onNoteDeleteButton(event) {
            delete this.factorNotes[this.currentNoteFactorName];
            this.$forceUpdate();
        },
        postpone(event) {
            let latestSubmission = this.previousSubmissions[0];
            let ld = null;
            if (latestSubmission) {
                ld = latestSubmission.date;
            }
            let now = new Date();
            if (latestSubmission && now.getYear() == ld.getYear() &&
                    now.getMonth() == ld.getMonth() && now.getDay() == ld.getDay()) {
                this.previousSubmissions.shift();
            }
            this.previousSubmissions.unshift({
                date: now,
                points: this.numTotalPoints
            });
            let newDeadline = new Date(this.deadline.valueOf());
            do {
                newDeadline.setDate(newDeadline.getDate() + 7);
            } while (newDeadline < now);
            if (!this.previousDeadline) {
                this.previousDeadline = this.deadline;
            }
            this.deadline = newDeadline;
        },
        undoPostpone(event) {
            let now = new Date();
            let newDeadline = new Date(this.deadline.valueOf());
            newDeadline.setDate(newDeadline.getDate() - 7);
            if (newDeadline > now || newDeadline.getYear() == now.getYear() &&
                    newDeadline.getMonth() == now.getMonth() &&
                    newDeadline.getDate() == now.getDate()) {
                this.deadline = newDeadline;
            } else if (this.previousDeadline) {
                this.deadline = this.previousDeadline;
                this.previousDeadline = null;
            }
        },
        confirmSubmit(event) {
            this.resetForm();
            location.href = "#";
        }
    },
    mounted() {
        document.body.className = "";
    }
});

$(function() {
    const studentNames = new Bloodhound({
        local: ["Magnus Teekivi", "Merli Lall", "Ragnar Rebase",
                "Aivar Loopalu", "Britta Pung"],
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.whitespace
    });
    studentNames.initialize();

    $("#students").tagsinput({
        maxTags: 2,
        freeInput: false,
        typeaheadjs: [
            {
                higlight: true,
            },
            {
                source: studentNames.ttAdapter()
            }
        ]
    });
    $("#students").tagsinput("input").on("input keydown paste", function(event) {
        if ($("#students").tagsinput("items").length >= 2) {
            event.preventDefault();
        }
    }).on("blur", vm.checkStudents);
    $("#students").on("itemAdded itemRemoved", vm.checkStudents);
    $('[data-toggle="popover"]').popover({ html: true });
    $('[data-toggle="tooltip"]').tooltip({ html: true });

    $("#homeworkUrl").typeahead({
        minLength: 5
    },
    {
        name: "uniid-to-dijkstra-url",
        async: false,
        source: function(query, syncResults) {
            if (query.match(/^[a-zA-Z]+\.?[a-zA-Z]+$/)) {
                syncResults([`http://dijkstra.cs.ttu.ee/~${query}/ui/t3/`])
            }
        }
    });
    $("#homeworkUrl").bind("typeahead:select", vm.checkHomeworkUrl);
});
