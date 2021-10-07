import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input",'results','hidden','selected','button',"options"]
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
