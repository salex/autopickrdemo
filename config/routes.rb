Rails.application.routes.draw do
  get 'demo/show'
  get 'demo/search'
  get 'demo/display'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  # Almost every application defines a route for the root path ("/") at the top of this file.
  root "demo#show"
end
