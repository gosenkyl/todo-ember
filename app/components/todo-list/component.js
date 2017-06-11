import Ember from 'ember';
import {task} from 'ember-concurrency';

export default Ember.Component.extend({

  store: Ember.inject.service("store"),

  todos: Ember.A(),

  init(){
    this._super(...arguments);

    Ember.get(this, "fetchData").perform();
  },

  fetchData: task(function * (){
    let todos = yield Ember.get(this, "store").findAll("todo");
    Ember.set(this, "todos", todos);
  })

});
