
/* List view is already a component */

ListView = Vue.component('list-view', (
{
  data: function() {
    return { entrylist: this.$parent.entrylist } // BAD IDEA: see appdata below...
  },
  template: '<div class="two columns"><h2>Nimekiri</h2><ul><list-item v-for="item in entrylist" :key="item.id" :idnum="item.id" :name="item.name"></list-item></ul></div>',
}
))


/* nice component */
Vue.component( 'list-item', (
  {
    props: [ 'idnum', 'name'],
    computed: {
      addr: function() {
        return "#/item/" + this.idnum;
      }
    },
    template: '<li><a :href="addr">{{name}}</a></li>'
  }
))

/*addview tuleb ise edasi arendada*/
/*add-view on child*/
const Add = Vue.component('add-view', (
  {
    /*props:['name', 'email'],*/
    data: function() {
      return {
        entrylist: this.$parent.entrylist,
        newName: "",
        newEmail: "",
        errors: [],
        newNameInvalid: false,
        newEmailInvalid: false,
        lastAdded: "",
      } // NOTE BAD IDEA HERE TOO: see below
  },
  methods: {
    addNew: function() {
      this.newNameInvalid = this.newEmailInvalid = false;
      if (!this.newName.trim()) {
        this.newNameInvalid = true;
      }
      if (!this.newEmail.trim() || !this.newEmail.includes("@")) {
        this.newEmailInvalid = true;
      }
      if (!this.newNameInvalid && !this.newEmailInvalid) {
        this.entrylist.push({id:this.entrylist.length, name:this.newName, email:this.newEmail})
        this.lastAdded = this.newName;
        this.newName = this.newEmail = "";
      }
    }
  },
  template:
  `
  <div>
  <h2>Lisamine</h2>
  <form @submit.prevent="addNew">
  <div class="success" v-if="lastAdded">
    Lisati koer "{{ lastAdded }}".
  </div>
  <ul class="error">
    <li v-if="newNameInvalid">Nimi pole sisestatud.</li>
    <li v-if="newEmailInvalid">E-mail pole sisestatud või on ebakorrektne.</li>
  </ul>
  Nimi:
  <input type="text" v-model="newName" v-bind:class="{ invalid: newNameInvalid }" />
  <br/>
  E-mail:
  <input type="text" v-model="newEmail" v-bind:class="{ invalid: newEmailInvalid }" />
  <br/>
  <button>Lisa</button>
  </form>
  </div>
  `
}
))

DetailView = Vue.component('detail-view', (
    {
  computed: {
    dog() {
      for (entry of this.$parent.entrylist) {
        if (entry.id == this.$route.params.id) {
          return entry;
        }
      }
    }
  },
  template:
    `<div v-if="dog"><h1>Details {{$route.params.id}}</h1>
    <div>Name: {{dog.name}}</div>
    <div>E-mail: {{dog.email}}</div></div>
    <div v-else><h1>Details</h1>
    <div><strong>No such dog found.</strong></div></div>`
}
))

/* APPLICATION STATE */

/*
NOTE: bad idea to use it for sharing data directly. We should
be sharing parts of it to components as needed and we should
be changing it using events since it will be a debugging hell
for anything non-trivial.
*/

const appstate =
    {
      entrylist: [
        { id:0, name:"Peeter", email: "peeter@gmail.com" },
        { id:1, name:"Mati", email:"m@ati.ee" }
      ]
    }


/* ROUTER ELEMENTS */
routes = [
  { path: '/list', component: ListView },
  { path: '/add', component: Add },
  { path: '/item/:id', component: DetailView }
]

const router = new VueRouter(
  {routes, linkActiveClass: "button-primary"}
)

/* VUE APP */

var vm = new Vue(
{
  router,
  data: appstate
}
).$mount('#dogapp');
