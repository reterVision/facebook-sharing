FacebookSharing::Application.routes.draw do
  root :to => 'home_page#index'

  get "search_url" => "home_page#search_url", :as => 'search_url'
  get "search_book" => "home_page#search_book", :as => 'search_book'
  post "home_page" => "home_page#succeed", :as => 'home_page'
end
