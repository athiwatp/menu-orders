<template>

  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="menu-ordersBox">
          <span class="" v-for="item in items">
            {{ item.text }}
            <button class="delete" @click="removeTodo(item['.key'])"></button>
            <button @click="addToOrder(item)">Add </button><br>
          </span>
          <br><br>
          <form @submit.prevent="addToMenu">
            <p class="control has-addons">
              <input class="input is-primary is-large" v-model="newTodo">
              <a class="button is-info is-large" @click="addToMenu">
                Add #{{ items.length }}
              </a>
            </p>
          </form>
          <hr>
          <button class="button is-danger is-outlined is-large" @click="clearTodo">Clear</button>
          <button class="button is-large" @click="log">log</button>
          <hr>
          <div class="" v-for="menuItem in order">
            {{menuItem.text}}
          </div>
        </div>
      </div>
    </div>
  </section>

</template>

<script>
var firebase = require('firebase')
var config = {
  apiKey: 'AIzaSyB0kczzbqHyM3oBt3_dnIkuZ2HVklyyRcs',
  authDomain: 'localhost:8080', // 'menu-orders.firebaseapp.com',
  databaseURL: 'https://menu-orders.firebaseio.com',
  storageBucket: ''
}
firebase.initializeApp(config)
var itemsRef = firebase.database().ref('items')
var orderRef = firebase.database().ref('order')

export default {
  data () {
    return {
      newTodo: ''
    }
  },
  components: {},
  firebase: {
    // can bind to either a direct Firebase reference or a query
    items: itemsRef.orderByChild('text'),
    order: orderRef.orderByChild('text')
  },
  methods: {
    addToOrder: function (item) {
      let newItem = {
        text: item.text
      }
      orderRef.push(newItem)
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
    addToMenu: function () {
      if (this.newTodo.trim()) {
        // update the Firebase reference!
        itemsRef.push({
          text: this.newTodo
        })
        // reset input box
        this.newTodo = ''
      }
    }
  }
}
</script>

<style lang="scss">
@import "~bulma";
.menu-ordersBox {
  width: 300px;
  height: 700px;
  border:1px dotted #CCCCCC;
}
.tag {
  margin-right: 100vh;
}
</style>
