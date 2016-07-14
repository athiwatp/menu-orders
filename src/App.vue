<template>

  <login-page v-if="!user" :login-action="login"></login-page>

  <section class="section" v-if="user">
    <div class="container">
      <div class="columns">
        <div class="column is-12">
          <img class="user-photo" :src="userPhotoURL" alt="" />
          <button class="button is-large" @click="logout">Logout</button>
        </div>
      </div>
      <div class="columns">
        <div class="column is-6">
          <h1>{{mode}}</h1>
          <button class="button" @click="mode = 'seveneleven'">seveneleven</button>
          <button class="button" @click="mode = 'waterway'">waterway</button>
          <hr>
          <span class="tag is-warning is-large" v-for="item in items">
            <span @click="addItemToOrder(item)">{{ item.text }}</span>
            <button class="delete" @click="removeTodo(item['.key'])"></button>
          </span>
          <br><br>
          <form @submit.prevent="addTodo">
            <p class="control has-addons">
              <input class="input is-primary is-large" v-model="newTodo">
              <a class="button is-info is-large">
                เพิ่มรายการอาหาร
              </a>
            </p>
          </form>
        </div>

        <div class="column is-6">
          <span class="tag is-success is-large" v-for="item in order">
            {{ item.text }}
            <img class="order-item-owner" :src="item.user.photoURL" alt="" width="24px" height="24px"/>
            <button class="delete" v-if="item.user.uid === user.uid" @click="removeItemFromOrder(item['.key'])"></button>
          </span>
          <hr>
          <button class="button is-danger is-outlined is-large" @click="clearOrder">Clear</button>
          <!-- <button class="button is-large" @click="log">log</button> -->
        </div>
      </div>
    </div>
  </section>
  <section>
    รายการที่ต้องการสั่ง
    <table>
      <tr v-for="item in countOrder">
        <td>
          {{ item.menu }}
        </td>
        <td>
          {{ item.amount}}
        </td>
        <td>
          <div v-for="user in item.user_list" style="float: left">
              <img class="order-item-owner" :src="user.photoURL" alt="" width="24px" height="24px"/>
          </div>
        </td>
      </tr>
    </table>
  </section>
  <!-- <hr>

  <pre>
    {{user | json}}
  </pre> -->

</template>

<script>
import LoginPage from './components/LoginPage'

var firebase = require('firebase')
var config = {
  apiKey: 'AIzaSyB0kczzbqHyM3oBt3_dnIkuZ2HVklyyRcs',
  authDomain: 'menu-orders.firebaseapp.com',
  databaseURL: 'https://menu-orders.firebaseio.com',
  storageBucket: ''
}

firebase.initializeApp(config)
var provider = new firebase.auth.FacebookAuthProvider()
var itemsRef = firebase.database().ref('items')
var orderRef = firebase.database().ref('order')

export default {
  data () {
    return {
      items: [],
      newTodo: '',
      mode: 'seveneleven',
      user: null,
      showItemsOrder: []

    }
  },
  ready: function () {
    this.items = this[this.mode]
  },
  watch: {
    'mode': function (val, oldVal) {
      this.items = this[val]
    }
  },
  computed: {
    userPhotoURL: function () {
      return this.user.photoURL
    },
    countOrder: function () {
      var order = this.order
      var orderName = order.map(function (item) {
        return item.text
      })
      .filter(function (element, index, self) {
        return index === self.indexOf(element)
      })

      var userOrder = []
      orderName.forEach(function (item) {
        var user = order.filter(function (value) {
          return value.text === item
        })
        .map(function (value) {
          return value.user
        })
        userOrder.push({menu: item, user_list: user, amount: user.length})
      })

      return userOrder
    }

  },
  components: {
    LoginPage
  },
  firebase: {
    // can bind to either a direct Firebase reference or a query
    seveneleven: itemsRef.orderByChild('mode').equalTo('seveneleven'),
    waterway: itemsRef.orderByChild('mode').equalTo('waterway'),
    order: orderRef
  },
  created: function () {
    let vm = this
    firebase.auth().onAuthStateChanged(function (user) {
      vm.$set('user', user)
    })
  },
  methods: {
    login: function () {
      firebase.auth().signInWithRedirect(provider)
    },
    logout: function () {
      firebase.auth().signOut().then(function () {
      }, function (error) {
        console.log(error)
      })
    },
    log: function () {
      console.log(this.items)
    },
    removeTodo: function (key) {
      let vm = this
      vm.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(function () {
        itemsRef.child(key).remove()
        vm.$swal(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      })
    },
    addTodo: function () {
      if (this.newTodo.trim()) {
        // update the Firebase reference!
        itemsRef.push({
          text: this.newTodo,
          mode: this.mode
        })
        // reset input box
        this.newTodo = ''
      }
    },
    addItemToOrder: function (item) {
      let { uid, displayName, photoURL } = this.user
      let newItem = {
        text: item.text,
        user: {
          uid,
          displayName,
          photoURL
        }
      }
      orderRef.push(newItem)
    },
    removeItemFromOrder: function (key) {
      let vm = this
      vm.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(function () {
        orderRef.child(key).remove()
        vm.$swal(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      })
    },
    clearOrder: function () {
      let vm = this
      vm.$swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, clear it!'
      }).then(function () {
        orderRef.set([])
        vm.$swal(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      })
    }
  }
}
</script>

<style lang="scss">
@import "~bulma";
.user-photo {
  width: 48px;
  height: 48px;
  border-radius: 24px;
}
.tag {
  margin: 10px;
}
.tag span {
  cursor: pointer;
}
.order-item-owner {
  border-radius: 12px;
  margin: auto 0px auto 6px;
}
</style>
