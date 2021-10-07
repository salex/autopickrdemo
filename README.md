# Going down the rails track to rail.7.0.0.alpha - it may be a bumpy ride

Okay, I'm not a real developer - but I've been using RoR since before v1.0. When I was still working, I tried to push the Rails approach to our state government agency, but they were scared of failing - so there are still using stuff like 4D (aka 4th Dimension, aka Silver Surfer - you might have to go back in history to find it, but it's still alive!) I retired and just write code for the heck of it. I have three apps that are more or less targeted to a single or small group of users. Two are apps used by a Veterans of Foreign War Post (VFW) that I wrote because I didn't want to keep pushing paper. The other is a golf group manager, which is used my my golf group and a few other. Think all started in about rails 3.x and are up to the latest 6.x. 

I decided to try to see what rail 7.x was going to do to my apps. Again, it may be a bumpy road to upgrade - a lot of stuff has changed, but if you want to move forward you are going to have to accept that there will be some pain.

Javascript has always been a pain, but ES6 is making in almost usable. I've never had a lot of Javascript, but a few of the apps have what I like to call `Spreadsheet like` pages. It's hard to do a double-entry ledger without some work to make sure the entrees balance before you submit it. I did it in pre-coffee days and it was horrible. CoffeeScript made it a little better, but it was still a pain.

I don't know when I discovered Stimulus, but I spent about 4 months a few years ago converting my CoffeeScript to stimulus controllers and css from Zurb Foundation to plain old W3.css. Since then I've biting on Tailwind and have one app partially converted to a mixture. 

Both Stimulus.js and Tailwind is being pushed as almost the default paths - and probably the best.

I decided to replicate the DHH screen cast on Rail 7 and tried the three approaches. I only have two imported stimulus packages `stimulus-flatpickr` which is a wrapper on pure flatpickr.js, and stimulus-autocomplete which is a search and select widget. They were my test cases on how rails 7 was going to fit in.

* Import Maps - default
    * Worked okay but Tailwind didn't have any customization that I could find. You can't add colors or components, etc.
    * With a little work and finding a stimulus 3.x branch I got stimulus.flatpick.js to work. Couldn't get stimulus-autocomplete.js to work.
* ESbuild
    * Almost like webpacker, which is a pain in the ass. You still have all the yarn stuff, but there are no packs, you're just using yarn to add JS packages then import what you need.
    * stimulus-flatpicker semi-worked, but I couldn't get the flatpickr.css to load. If you take the default tailwind.css path, there seemed to be no way to add other css files. I posted an issue on rails about this and someone pointed out a way to have tailwind.css and application.css to be created, but you are limited to two with this approach - that left my w3.css out without a kludge.
    * stimulus-autocomplete did not work - which the main reason for the post
* webpacker
    * no thanks - will be glad to get rid of it. It worked, but once you went through the pain of getting it to work, you didn't want to change anything.

Enough history, there is always a way to solve problems - like replacing stimulus-autocomplete. Stimulus-autocomplete is almost a pure JS program (in a stimulus controller) that uses another stimulus-controller to fire it off. It is rather simplistic - at least now, but was confusing when I first tried to use it.

You use an html markup to register the application (or slim in my case, I understand indented/hierarchical lists a lot better than tags. The template contain 5 parts

* a wrapper block that defines the controller
* an input tag that is the text field to enter what you are searching for
* a hidden input tag that stores the selected result after a result is selected (clicked)
* a ui element where the query result will be displayed
* a url that calls the search method that creates and returns li elements that match the input.

The search method is responsible to do the query and return li elements that contain ids, urls etc

After a few days of trying to replicate how stimulus-autocomplete worked in a stimulus controller I got it to do probably about 90% of what autocomplete does in about 60 lines of code

So I created a new rails app. Generated a demo controller with  show, search and select methods. There is no database. A hash simulates a person model with only a name and id attribute.

* `show` displays the base template in show view. The view also contains a flatpickr template and fontawsome icon to make sure at leasts those 3 things work in Rails 7.
* `search` does the query and return the li's
* `select` just displays the results.

The demo controller:

```ruby
class DemoController < ApplicationController
  def show
  end

  def display
    set_db
  end

  def search
    set_db
    @search_results = []
    @db.each do |k,n|
      if n[:name].downcase.index(params[:input].downcase)
        @search_results << [n[:name],k]
      end
    end
    return(render layout: false)
  end

  private

  def set_db
    names = %w(steve jan butch lori james Jamie Chappel drew sarrah poochie wimpie callie cammie momma peaks grouchie leftey rightey tigger).sort
    @db = {}
    names.each.with_index do |n,i|
      @db[i] = {name:n,id:i}
    end
  end

end
```

The autopickr template/markup that is contained in the show template

```ruby-slim
div[
  data-autopickr-url-value="/demo/search" 
  data-controller="autopickr"
  data-autopickr-slen-value="1"
  class=blueBox
  ]
  / just calling a helper blueBox to set tailwind classes for a simple button
  div
    = text_field_tag(:input,nil,
      data:{autopickr_target:"input", action:"autopickr#search" },
      placeholder:"Search...",class:"w-48 px-1 my-2",autofocus:true)
    / span = link_to('Pick',nil,data:{autopickr_target:"button"}, 
    / class:"bg-blue-500 hover:bg-blue-700 text-white font-bold mx-2 py px-2 rounded inline-block hidden")
  div = hidden_field_tag('selected_id',nil,
    data:{autopickr_target:"hidden",action:"change->autopickr#selected"})
  ul.text-black.bg-gray-100.max-h-72.divide-y.divide-fuchsia-300.overflow-scroll[data-autopickr-target="results"] 
```

There are a few things I added. Stimulus had a few options, one was how many character should be enter before a seach is triggered. I just added `data-autopickr-slen-value="1"` that you set to how many character will trigger a search. I also added a button that would trigger the display instead of clicking on the li. I have a couple uses where I'd have a button that would do more than just display the results (duplicate a ledger entery)

The controller search menthod renders `demo/search.html.erb` that generates the li's

```ruby
<% @search_results.each.with_index do |result| %>
  <li class="hover:bg-blue-100 p-1" role='option' data-action="click->autopickr#select" data-select-id="<%= result[1] %>"
    data-select="/demo/display?id=<%= result[1] %>" > <%= result[0] %></li>
<% end %>

```

The stimulus controller

```javascript
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input",'results','hidden','selected','button']
  static values = { url: String ,slen: Number}

  connect() {
    console.log("Hi autopickr")
    let slen  // slen is the number of charcters entered before we search/query
    if (this.hasSlenValue) {
      this.slen = this.slenValue
    }else{
      this.slen = 1
    }
    this.inputTarget.click() // activate the autofocus target
  }

  select(){
    const selected = event.target
    if (this.hasButtonTarget) {  // if there is a button target, display instead of following url
      this.buttonTarget.classList.remove('hidden')
      this.buttonTarget['href'] = selected.dataset.select
    }else{
      location.assign(selected.dataset.select)
    }
  }

  selected(){
    this.clear_results()
  }

  clear_results(){
    while (this.resultsTarget.firstChild) {
      this.resultsTarget.removeChild(this.resultsTarget.firstChild);
    }
  }

  async search(){
    var len = this.inputTarget.value.length
    if (len >= this.slen) { 
      let response = await fetch(this.urlValue+`?input=${this.inputTarget.value}`);
      let data = await response.text();
      let frag = document.createRange().createContextualFragment(data);
      this.clear_results()  // set result to no children
      this.resultsTarget.appendChild(frag) // rebuild the results
    }
  }
}

```