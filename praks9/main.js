
/* List view is already a component */

ListView = Vue.component('list-view', (
{
  props: ['entrylist'],
  template:
  `
  <div class="six columns">
  <ul><list-item v-for="item in entrylist" :key="item.id" :idnum="item.id" :name="item.name" :fav="item.fav"></list-item></ul>
  </div>
  `,
}
));


/* nice component */
Vue.component( 'list-item', (
  {
    props: [ 'idnum', 'name', 'fav'],
    computed: {
      addr: function() {
        return "#/item/" + this.idnum;
      }
    },
    template: '<li><a :href="addr">{{name}} (❤️ {{fav}})</a></li>'
  }
))

const Add = Vue.component('add-view', ({

  data: function() {
    return {
      name: "",
      fav: ""
    };
  },
  methods: {
    addNew: function() {
      this.$store.commit("addAlchemist", {
        name: this.name,
        fav:  this.fav
      });
      this.name = "";
      this.fav = "";
    }
  },
  template:
  `
  <div>
  <h2>Lisamine</h2>
  <form>
  <input type="text" id="name" v-model="name" placeholder="Nimi" />
  <input type="text" id="fav" v-model="fav" placeholder="Lemmikelement" />
  <input type="submit" @click="addNew"/>
  </form>
  </div>
  `
}
));

const DetailView = {
  props: ['id'],
  computed: {
    item() {
      return this.$store.state.alchemilist[this.id]
    }
  },
  template:
  `
  <div>
    <h1>Detailid {{id}}</h1>
    <div>Nimi: <strong>{{item.name}}</strong></div>
    <div>Element: <strong>{{item.fav}}</strong></div>
  </div>`
};

/* APPLICATION STATE */

/* ADD STORE HERE*/
Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    alchemilist: [
      { id: 0, name: 'Hermes Trismegistus', fav:'Earth'},
      { id: 1, name: 'Ostanes', fav:'Fire'},
      { id: 2, name: 'Nicolas Flamel', fav:'Air'},
      { id: 3, name: 'Perenelle Flamel', fav:'Water'}
    ]
  },
  mutations: {
    addAlchemist(state, alchemist) {
      alchemist.id = state.alchemilist.length;
      state.alchemilist.push(alchemist);
    }
  },
  getters: {
    getWaterAlchemists: state => state.alchemilist.filter(alchemist => alchemist.fav.toUpperCase() == "WATER")
  }
});

/* ROUTER ELEMENTS */
routes = [
  { path: '/list', component: ListView, props: {entrylist: store.state.alchemilist} },
  { path: '/list-water', component: ListView, props: function() { return {entrylist: store.getters.getWaterAlchemists}; } },
  { path: '/add', component: Add },
  { path: '/item/:id', component: DetailView, props: true }
]

const router = new VueRouter(
  {routes, linkActiveClass: "button-primary"}
)

// store needs an alchemist list with
// a mutator to add alchemists
// a getter for a free alchemist in it and a getter which filters only Water alchemists


/* VUE APP */

var vm = new Vue(
{
  router,
  store, // provides this.$store object to the components, but you need to create store obj first
}
).$mount('#app');
