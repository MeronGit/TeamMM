var vm = new Vue({
  el: "#cats",
  data: {
    tabNo: 0,
    cats: [
      {name: "Kurri", birthYear: 2003},
      {name: "Nublu", birthYear: 2006}
    ],
    newName: "",
    newBirthYear: 0
  },
  methods: {
    getCurrentTabTitle: function() {
      return ["Nimekiri", "Lisa kass"][this.tabNo];
    },
    switchTab: function(no) {
      this.tabNo = no;
    },
    addNew: function() {
      this.cats.push({name: this.newName, birthYear: this.newBirthYear});
      this.newName = "";
      this.newBirthYear = 0;
      this.switchTab(0);
    }
  }
});
