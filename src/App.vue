<template>

  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column">
          <span class="tag is-warning is-large" v-for="item in items">
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

export default {
  data () {
    return {
      newTodo: ''
    }
  },
  components: {},
  firebase: {
    // can bind to either a direct Firebase reference or a query
    items: itemsRef.orderByChild('text')
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss">
@import "~bulma";

.tag {
  margin-right: 20px;
}
</style>
