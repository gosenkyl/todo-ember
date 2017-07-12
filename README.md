# **Welcome to Todo MVC in Ember.js**

First, a quick little background of why I love Ember in a market dominated currently, 2017, by Angular and React.

## What we'll be building

We will be building a small app based off of [TodoMVC](http://todomvc.com/examples/emberjs/). We will be focusing on functionality and not styling. As much as I love making things look and feel nice, I would rather zero in on Ember related material and keep your mind from being overwhelmed with too many different thoughts at once.

If there are any questions, comments or suggestions, feel free to reach out to me at kylegosendev@gmail.com. I plan on adding a more intermediate project in the future. Maybe another common learning project, a playlist app similar to Spotify's design so we can go a little more in-depth on components, routes and how they interact with each other.

I will try not to make this too dry, I am a hands on learner and immediately scared off by blocks of text. I will try to keep explanations short and to the point, feel free to ask questions if you would like things more in-depth.

## Let's get started!

### Requirements:
[Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/)

Open a terminal and execute `npm install -g ember-cli`
If you're unfamiliar with npm, it is a package manager that makes managing dependencies quick and easy. The 'g' flag installs ember-cli at a global level, meaning you can use it anywhere rather than just the project you're currently working on.

Go to the directory you wish to create your project and run `ember new todo-ember` followed by `cd todo-ember`. The ember-cli is an amazing tool that AngularJS recently copied. It uses blueprints to generate common templated code for us.

??? **TODO GIT**

I have a few branches created in case we lose each other. Right now we should be in

### master

Execute ``ember s``, the 's' being short for serve or server. If we open a browser and go to [localhost:4200](localhost:4200), we should see the out-of-the-box ember app to let us know that everything is set up properly!

First, let's modify `.ember-cli`. Add a new variable `"usePods": true`. This is not necessarily necessary, but a strong personal preference. This will tell the ember cli generator that we want to create all of our related files in directories by component rather than by the type of the file. Without `"usePods": true` we will end up with our Javascript in one directory, our HTML related to that Javascript in another, and our route in yet another. Because we are choosing to use pods, we can go ahead and delete the directories `controllers, models, routes and templates`, to remove any confusion later on.

Because we are choosing to focus on one thing, Ember, we will install a package that helps mock a back-end for us `npm install --save-dev ember-cli-mirage`. [Ember CLI Mirage](http://www.ember-cli-mirage.com/) can be useful for things such as staging test data as well.

Create a directory in the root of todo-ember called `mirage`. In the mirage directory, create a file called `config.js` and add the following.

```javascript
export default function(){

}
```

We are all configured and ready to get to work.

### step-1

> Note: If you see IDE errors and you're using IntelliJ, go to settings -> languages and frameworks -> javascript -> and change the version to ES6

`ember g model todo`

Add a couple of variables to the generated model.

```javascript
description: DS.attr(),
status: DS.attr()
```

A model is the representation of data as well as it's relationships to other models/data.

`ember g serializer todo`

Change the type of serializer to DS.JSONSerializer. A serializer tells Ember how to serialize and de-serialize data coming from and going to the data source. On top of the general support a serializer gives you, you can do things such as rename a variable to match the data source.

`ember g adapter todo`

Change the type of adapter to DS.RESTAdapter. Add the following variables to todo/adapter.js

```javascript
host: "http://localhost:4200"
namespace: "api"
```

An adapter tells Ember how to communicate with the back-end. Generally you would put your base services endpoint in a base adapter and extend that. Adapters use common verbs to predict your endpoint following typical convention, so if your "todos" endpoint is actually found at "yourapp.com/api/items" instead of "yourapp.com/api/todos", you would override the pathForType function and return "items".

`ember g route application`

`ember g component todo-list`

application/template.hbs
```
{{todo-list}}
```

Add some text to components/todo-list/template.hbs and make sure it's rendered. The application route is a special route in Ember, it's the base route that is called [localhost:4200](localhost:4200).

Let's set up our Mirage to display some static data.

mirage/config.js
```javascript
this.namespace = 'api';

this.get('/todos', () => {
	return [
			{id: 1, description: "Learn Ember", status: "ACTIVE"},
			{id: 2, description: "Grocery Shopping", status: "ACTIVE"},
			{id: 3, description: "Clean House", status: "ACTIVE"}
	];
})
```

All we're doing here is telling Mirage to intercept any GET call to api/todos, and return a pre-defined array of JSON objects.

`ember install ember-concurrency`

Relatively new, ember concurrency is an ember add-on that makes handling asynchronous calls clean and easy.

components/todo-list/component.js
```javascript
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
```

There's a lot going on here. First of all, we're injecting a service called "store". Store is a service that Ember has created to expose the underlying ember-data store object that maintains our models. It includes functions that allow us to retrieve, save and delete data. An important thing to remember about services is they are singletons, there is only one instance of a given service. Next, we initialize a variable called "todos" to Ember's wrapper of a Javascript array that gives us a few nice helper functions. fetchData is a task that fetches todos from the store (asynchronously!) and sets the result to our todos variable. We invoke the fetching of the data in the init of our component by calling perform on the task.

components/todo-list/template.hbs
```
{{#each todos as |todo|}}
  <div>{{todo.description}}</div>
{{/each}}
```

Let's add a for each loop to our template using handlebars. For each object in the array "todos", aliased as "todo", we will print out the description by referencing `todo.description`.

If we take a look at [localhost:4200](localhost:4200), we should see our static Mirage descriptions printed out!

### step-2

Now, let's make our Mirage dynamic so we can create, read, update and delete rather than just serve static data.

Add a directory to mirage called fixtures. In fixtures, create a file called `todos.js`.

```javascript
export default [
	{id: 1, description: "Learn Ember", status: "ACTIVE"}
];
```

In mirage/config.js, let's start using the Mirage database.

Change the get for todos to:

```javascript
this.get('/todos', (schema) => {
	return schema.db.todos;
});
```

If we start ember (ember -s), we should see the item(s) from our todo fixture.

Now let's add the ability to create new todos. Add an input field to components/todo-list/template.hbs

```javascript
<div>{{input type="text" value=createTodo enter="onCreateTodo"}}</div>
```

As well as the corresponding variable and action to components/todo-list/component.js

```javascript
createTodo: null

postData: task(function * (description){
	let todo = {id: Math.random() * 100, description: description, status: "ACTIVE"};
	let model = Ember.get(this, "store").createRecord("todo", todo);
	yield model.save();
	Ember.set(this, "createTodo", null);
}),

actions: {
	onCreateTodo(){
		Ember.get(this, "postData").perform(this.get("createTodo"));
	}
}
```

When enter is pressed, an action is dispatched to the actions hash. From there, we call our task
to POST the todo with the description entered in the text box. We format an object (with a random id for now), create the record
in the Ember store and call save. If we add a function to handle the POST of a todo in Mirage, it will proxy the call and save the record in memory.

In mirage/config.js

```javascript
this.post('/todos', (schema, request) => {
  let todo = JSON.parse(request.requestBody);
  return schema.db.todos.insert(todo);
});
```

The Mirage database is updated with the value we passed and the template renders the update. We then clear the todo description for the next one to be entered. We won't worry about handling errors for now.

We should now have a functional component with the ability to add todos to the list.

> Note: you can remove the value we added to mirage/fixtures/todos if preferred).

### step-3

Let's add a filter that allows us to display active todos, completed todos or all todos.

We'll start by adding a property to the todo-list/component.js and initializing it to all.

```javascript
filterStatus: "ALL"
```

We will add a few computed properties for quick comparison.

```javascript
isFilterAll: Ember.computed.equal("filterStatus", "ALL"),
isFilterActive: Ember.computed.equal("filterStatus", "ACTIVE"),
isFilterCompleted: Ember.computed.equal("filterStatus", "COMPLETED"),
```

A computed property is something built into Ember. It is very smart about recalculating the value based on whether or not the value it's "computed" on has changed since it was calculated last. It is important to know that it does NOT re-compute when the value of what is computed on changes but rather when the property is fetched. Since we are not yet using any of these properties in our template, the only time the value of say, isFilterAll, will change is when we asked for isFilterAll and filterStatus has changed.

property -> 0..* dependent properties -> cached value -> function to compute the value if a property it's dependent on has changed.

Let's take the following example.

```javascript
filterStatus: "ALL"
isFilterAll: Ember.computed.equal("filterStatus", "ALL")

Ember.get(this, "isFilterAll") -> isFilterAll = true
Ember.set(this, "filterStatus", "ACTIVE") -> isFilterAll = true (because we have yet to invoke get on it)
Ember.get(this, "isFilterAll") -> isFilterAll = false (internally, it realizes filterStatus has changed since we have last asked for it, re-computes and returns false)
Ember.get(this, "isFilterAll") -> isFilterAll = false (internally, it realizes filterStatus has NOT changed since we last asked for it, it returns the currently cached version false)
```

Using the property in the template puts an observer on the property, so it is always asking for the property and essentially always recomputes when a dependent property changes immediately. Computeds are a little confusing at first and much easier to explain in practice. Hopefully they will make a little more sense as we use them more.

Now, we will write another computed property to limit the result of our todos based on the status we just added

```javascript
filteredTodos: Ember.computed("todos.[]", "todos.@each.status", "filterStatus", function(){
	let todos = Ember.get(this, "todos");
	let filterStatus = Ember.get(this, "filterStatus");
	if("ALL" === filterStatus){
	  return todos;
	}

	return todos.filterBy("status", filterStatus);
}),
```

Another computed. This time, we are computing on the array of todos, so if a todo is added or removed from the list OR the status of a todo changes OR the filter status changes, when we ask for filteredTodos, it will re-calculate it's value. If we ask for filteredTodos 5 times before any todos are added or removed and the filter status remains the same, Ember will quickly return the value of filteredTodos from it's cache since it knows nothing you told it to compute on has changed so the result will be the same.

In our template, we will loop through our list of filteredTodos rather than todos.

`{{#each filteredTodos as |todo|}}`

Everything should work the same.

Let's display the status and add a little CSS to make things display in one row.

todo-list/template.hbs in the each loop
```javascript
<div class="flex-row">
	<div>{{todo.description}}</div> - <div>{{todo.status}}</div>
</div>
```

styles/app.css
```
.flex-row {
	display: flex;
	flex-direction: row;
}
```

Now, we will display a few buttons that will filter the todos.

todo-list/template.hbs - bottom
```
<div class="flex-row">
    <div class="button {{if isFilterAll "is-active"}}" {{action "onFilter" "ALL"}}>All</div>
    <div class="button {{if isFilterActive "is-active"}}" {{action "onFilter" "ACTIVE"}}>Active</div>
    <div class="button {{if isFilterCompleted "is-active"}}" {{action "onFilter" "COMPLETED"}}>Completed</div>
</div>
```

We will conditionally add an is-active class if the filter is selected and bind an on-click action to the div that calls an action we will define in the component called onFilter with 1 parameter, the filter value.

styles/app.css
```
.button {
	padding: 10px;
}

.is-active {
	border: thin solid darkblue;
}
```

Again, minimal CSS but enough to make things legible.

todo-list/component.js - in our actions hash

```javascript
onFilter(status){
	Ember.set(this, "filterStatus", status);
}
```

Make sure everything is working. We should be able to add todos and filter by all, active and completed at this point, even though it is not possible for a todo to be completed at this time.

### step-4

### Delete

Let's add another div in our each loop.

```
<div class="button" {{action "onDelete" todo}}>delete</div>
```

Create an action called onDelete with a param of a todo.

```javascript
onDelete(todo){
	Ember.get(this, "deleteData").perform(todo);
}
```

Define a task to asynchronously delete the todo in focus.

```javascript
deleteData: task(function * (todo){
  yield todo.destroyRecord();
}),
```

And handle the delete request in mirage.

```javascript
this.del('/todos/:id', (schema, request) => {
  let id = request.params.id;

  return schema.db.todos.remove({id: id});
});
```

We should now be able to delete a todo.

### Filter

Let's also allow them to be marked as completed. First, we'll add the ability to update a record to our mirage config.

```javascript
this.put('/todos/:id', (schema, request) => {
  let todo = JSON.parse(request.requestBody);

  return schema.db.todos.update(request.params.id, todo);
});
```

Let's add an indicator in our loop of filtered todos that shows whether it's completed and allows us to update that status.

```
<div class="circle {{if (eq todo.status "COMPLETED") "filled"}}" {{action "onUpdateStatus" todo}}></div>

.circle {
  width: 20px;
  height: 20px;
  border: thin solid black;
  border-radius: 100%;
}

.filled {
  background-color: blue;
}
```

There is nothing built into handlebars that allows us to compare strings so we will create a helper function in Ember to do so.

`ember g helper eq`

```javascript
import Ember from 'ember';

export function eq(params) {
	return params[0] === params[1];
}

export default Ember.Helper.helper(eq);
```

As you can imagine, helpers are useful for all sorts of things. For example, you could create one to add two numbers together, format currency, dates and many other things.

Now, let's handle the new action we introduced in the template.

```javascript
onUpdateStatus(todo){
	let currentStatus = Ember.get(todo, "status");
	let updatedStatus = currentStatus === "ACTIVE" ? "COMPLETED" : "ACTIVE";

	Ember.set(todo, "status", updatedStatus);

	Ember.get(this, "updateData").perform(todo);
}
```

We pass the todo the user clicks on to the action, change the status to the opposite of what it currently is, and fire an asynchronous call to update the record in Mirage.

```javascript
updateData: task(function * (todo){
	yield todo.save();
}),
```

We should now be able to update the status of a todo and the filteredTodos computed should do it's job!

### step-5

Add another input to the template...

```
<div>{{input type="text" value=searchText placeholder="Search"}}</div>
```

and the corresponding variable to the component.

```javascript
searchText: ""
```

We need to add searchText to our list of computed variables so Ember recalculates our filteredTodos when we type something in the searchText input.

Refactor filteredTodos to not only filter on the status selected, but the search text as well.

```javascript
filteredTodos: Ember.computed("todos.[]", "filterStatus", "searchText", function(){
    let todos = Ember.get(this, "todos");
    let filterStatus = Ember.get(this, "filterStatus");

    let filteredTodos = "ALL" === filterStatus ? todos : todos.filterBy("status", filterStatus);

    let searchText = Ember.get(this, "searchText");

    if(Ember.isPresent(searchText)) {
      searchText = searchText.toUpperCase();
      filteredTodos = filteredTodos.filter(function (todo){
          return Ember.get(todo, "description").toUpperCase().includes(searchText);
      });
    }

    return filteredTodos;
}),
```

Let's add the list of active todos as a finishing touch before we style things.

```javascript
activeTodos: Ember.computed.filterBy("todos", "status", "ACTIVE"),
activeCount: Ember.computed.reads("activeTodos.length"),
```

`<div>{{activeCount}} item(s) left!</div>`

We now have a relatively functional todo list! I suppose we need to style this thing before anybody would use it and maybe replace our in-memory Mirage data storage with a database but that's beside the point.

### step-6

You can check out the step-6 branch for my twist on styling.

You could add more features to this on your own such as hiding the status/search filters and active count until a todo exists, edit description so you don't have to delete and re-add for changes, delete all, strike through completed todos, etc. Maybe add a target date to complete each task.

We can also write unit and integration tests. They were automatically generate for us by the Ember CLI.

What ever you can think of!

I hope you learned and/or are enlightened to some of the stuff Ember can do. Let's recap some of the things we touched.


## Recap of what we (somewhat) learned:

* Ember CLI - Create a new project and generate blueprints (routes, models, serializers, adapters, components, helpers)
* Ember CLI Mirage - Configured to mock data as well as intercept REST calls and return data from an in-memory cache
* Ember Data - Interact with the Store and create a model, adapter and serializer to easily manage the data flow
* Ember Components - variables, functions, computeds, actions handlers, injection
* Handlebars - Mustache syntax
* Ember Concurrency - Management of asynchronous calls
	-

## What we DIDN'T cover that is very important. Second project?

* Nested routes (ex. person/1/address)
* Multiple re-usable components
	- We could create a button widget that takes in text to display, a conditional image, a click action, etc.

Useful Resources
* [emberjs](https://www.emberjs.com/)
* [component lifecycle](https://guides.emberjs.com/v2.13.0/components/the-component-lifecycle/)
* [mirage](http://www.ember-cli-mirage.com/docs/v0.3.x/)
* [Ember Concurrency](https://ember-concurrency.com/#/docs/introduction)
