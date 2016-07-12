<template>

  <Login v-if="!user" :login-action="login"></Login>

  <section class="section" v-if="user">
    <div class="container">
      <div class="columns">
        <div class="column is-12">
          <img :src="userPhotoURL" alt="" />
          <button class="button is-large" @click="logout">Logout</button>
        </div>
      </div>
      <div class="columns">
        <div class="column is-6">
          <span class="tag is-warning is-large" v-for="item in items" @click="addItemToOrder(item)">
            {{ item.text }}
            <button class="delete" @click="removeTodo(item['.key'])"></button>
          </span>
          <br><br>
          <form @submit.prevent="addTodo">
            <p class="control has-addons">
              <input class="input is-primary is-large" v-model="newTodo">
              <a class="button is-info is-large">
                Add #{{ items.length }}
              </a>
            </p>
          </form>
          <hr>
          <button class="button is-danger is-outlined is-large" @click="clearTodo">Clear</button>
          <button class="button is-large" @click="log">log</button>
        </div>

        <div class="column is-6">
          <span class="tag is-warning is-large" v-for="item in order">
            {{ item.text }}
            <img class="order-item-owner" :src="item.user.photoURL" alt="" width="24px" height="24px"/>
            <button class="delete" v-if="item.user.uid === user.uid" @click="removeItemFromOrder(item['.key'])"></button>
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- <hr>

  <pre>
    {{user | json}}
  </pre> -->

</template>

<script>
import Login from './components/Login'

var firebase = require('firebase')
var config = {
  apiKey: 'AIzaSyB0kczzbqHyM3oBt3_dnIkuZ2HVklyyRcs',
  authDomain: 'menu-orders.firebaseapp.com',
  databaseURL: 'https://menu-orders.firebaseio.com',
  storageBucket: ''
}
firebase.initializeApp(config)
var itemsRef = firebase.database().ref('items')
var orderRef = firebase.database().ref('order')

var provider = new firebase.auth.FacebookAuthProvider()

export default {
  data () {
    return {
      newTodo: '',
      user: null
    }
  },
  computed: {
    userPhotoURL: function () {
      return this.user.photoURL
    }
  },
  components: {
    Login
  },
  firebase: {
    // can bind to either a direct Firebase reference or a query
    items: itemsRef.orderByChild('text'),
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
      itemsRef.child(key).remove()
    },
    clearTodo: function () {
      itemsRef.set([])
    },
    addTodo: function () {
      if (this.newTodo.trim()) {
        // update the Firebase reference!
        itemsRef.push({
          text: this.newTodo
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
      orderRef.child(key).remove()
    }
  }
}
</script>

<style lang="scss">
@import "~bulma";

.tag {
  margin: 10px;
}
.order-item-owner {
  border-radius: 12px;
  margin: auto 2px auto 6px;
}
</style>
