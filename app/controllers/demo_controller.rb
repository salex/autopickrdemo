class DemoController < ApplicationController
  def show
  end

  def display
    set_db
    # render plain: "You picked-> #{@db[params[:id].to_i]}"
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
