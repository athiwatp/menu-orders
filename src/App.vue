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
          <!-- <h1>{{mode}}</h1>
          <button class="button" @click="mode = 'seveneleven'">seveneleven</button>
          <button class="button" @click="mode = 'waterway'">waterway</button>
          <hr> -->
          <h1 class="title">Menu</h1>
          <hr>
          <span class="tag is-warning is-large" v-for="item in items">
            <span @click="addItemToOrder(item)">{{ item.text }}</span>
            <button class="delete" @click="removeTodo(item['.key'])"></button>
          </span>
          <br><br>
          <form @submit.prevent="addTodo">
            <p class="control has-addons">
              <input class="input is-warning is-large" placeholder="เพิ่ม Menu ใหม่" v-model="newTodo">
              <button type="submit" class="button is-warning is-large">+</button>
            </p>
          </form>
        </div>

        <div class="column is-6">
          <h1 id="your-order" class="title">Your orders</h1>
          <hr>
          <span class="tag is-success is-large" v-for="item in userOrder">
            {{ item.text }}
            <img class="order-item-owner" :src="item.user.photoURL" alt="" width="24px" height="24px"/>
            <button class="delete" v-if="item.user.uid === user.uid" @click="removeItemFromOrder(item['.key'])"></button>
          </span>
          <hr>
          <h1 class="title">รายการที่ต้องการสั่ง</h1>
          <button class="button is-danger is-outlined" v-if="isSuperAdmin" @click="clearOrder">Clear</button>
          <table class="table is-narrow">
            <thead>
              <tr>
                <td>รายการ</td>
                <td>จำนวน</td>
                <td>&nbsp;</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in countOrder">
                <td>
                  {{ item.menu }}
                </td>
                <td class="is-medium">
                  {{ item.amount}}
                </td>
                <td>
                  <div v-for="user in item.user_list" style="float: left">
                      <img class="order-item-owner" :src="user.photoURL" alt="" width="24px" height="24px"/>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <a v-if="isSuperAdmin" href="http://line.me/R/msg/text/?{{countOrderTextUrlEncode}}">
            <img src="https://media.line.me/img/button/en/78x20.png" alt="LINE it!" />
          </a>

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
      mode: 'waterway',
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
    isSuperAdmin: function () {
      let superAdmin = ['77r5S85s4yNrvJM0Pbk8bfVqXA63', 'C3rf3ITyNIOui8BsZxeyAq86Itz1', 'xjSvAlRo2ldUTBZ1q15hX8S3PMk2', 'T1MdigKJjqftGK6KBPGxwvFd3Qa2']
      return superAdmin.find((admin) => admin === this.user.uid)
    },
    userPhotoURL: function () {
      return this.user.photoURL
    },
    userOrder: function () {
      let vm = this
      return this.order.filter((item) => item.user.uid === vm.user.uid)
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
    },
    countOrderTextUrlEncode: function () {
      return encodeURI(this.countOrder.reduce((previous, current) => {
        return (previous += current.menu + ' ' + current.amount + '\r\n')
      }, ''))
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
    getOffset: function (el) {
      var _x = 0
      var _y = 0
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft
        _y += el.offsetTop - el.scrollTop
        el = el.offsetParent
      }
      return { top: _y, left: _x }
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
      let sc = this.getOffset(document.getElementById('your-order')).top
      window.scroll(0, sc)
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
