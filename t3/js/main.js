$(function() {
    const studentNames = new Bloodhound({
        local: ["Magnus Teekivi", "Merli Lall", "Ragnar Rebase",
                "Aivar Loopalu", "Britta Pung", "J"],
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
    $("#students").tagsinput("input").on("keydown paste", function(event) {
        if ($("#students").tagsinput("items").length >= 2) {
            event.preventDefault();
        }
    });
    $('[data-toggle="popover"]').popover({
        html: true
    });

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

    document.body.className = "";
});

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
        factorNotes: {},
        currentNoteFactorName: "",
        currentNote: "",
        gracePoints: 0,
        additionalPoints: 0,
    },
    computed: {
        dueDatePointsPenalty() {
            return -5;
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
            let points = this.dueDatePointsPenalty;
            if (this.numBasePoints > 0) {
                points += this.numBasePoints;
                points += this.numBonusPoints;
            }
            return points;
        },
        pointsBarPercentage() {
            return Math.max(0, Math.min(100, (this.numTotalPoints / 20) * 100));
        },
        canSubmit() {
            return this.numTotalPoints >= 10;
        }
    },
    methods: {
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
        checkHomeworkUrl(event) {
            let homeworkUrl = $("#homeworkUrl").typeahead("val");
            if (!event.target.validity.valid) {
                this.homeworkUrlState = "incorrect";
            } else if (!homeworkUrl.trim()) {
                this.homeworkUrlState = "empty";
            } else {
                this.homeworkUrlState = "loading";
                let vm = this;
                setTimeout(function() {
                    if (vm.homeworkUrlState != "loading") {
                        return;
                    } else if (homeworkUrl.startsWith("http://dijkstra.cs.ttu.ee/~hacker/ui/t3")) {
                        vm.homeworkUrlState = "plagiarism";
                    } else {
                        vm.homeworkUrlState = "no-plagiarism";
                    }
                }, 1000);
            }
        }
    }
});
