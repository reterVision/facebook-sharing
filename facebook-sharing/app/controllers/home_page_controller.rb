require 'rubygems'
require 'nokogiri'
require 'open-uri'
require 'amazon/ecs'
require 'json'

class HomePageController < ApplicationController
	def index
  end

  def succeed
    redirect_to :back, :notice => "Succeed!"
  end

  def search_book
    Amazon::Ecs.configure do |options|
      options[:associate_tag] = 'Your_Associate_Tag'
      options[:AWS_access_key_id] = 'Your_ACCESS_KEY_ID'
      options[:AWS_secret_key] = 'YOUR_SECRET_KEY'
    end

    res = Amazon::Ecs.item_search(params[:book], {:response_group => 'Medium'})

    # Get first ten books.
    title_array = []
    desc_array = []
    image_array = []
    link_array = []

    index = 10
    if res.items.count < index
      index = res.items.count
    end
    res.items[0..index].each do |item|

      item_attributes = item.get_element('ItemAttributes')

      title_array << item_attributes.get('Title')
      desc_array << item_attributes.get('Author')

      if item.get_hash('MediumImage') != nil
        image_array << item.get_hash('MediumImage')['URL']
      elsif item.get_hash('SmallImage') != nil
        image_array << item.get_hash('SmallImage')['URL']
      elsif item.get_hash('LargeImage') != nil
        image_array << item.get_hash('LargeImage')['URL']
      end

      money_link = item.get_element('DetailPageURL').to_s
      money_link.gsub!(/\<\/*DetailPageURL\>/, "")
      link_array << money_link
    end

    @web_result = Hash.new
    @web_result['title'] = title_array
    @web_result['description'] = desc_array
    @web_result['images'] = image_array
    @web_result['book_link'] = link_array
    @web_result['total_images'] = image_array.count

    respond_to do |format|
      format.json {render :json => @web_result}
    end
  end

  def search_url
    doc = Nokogiri::HTML(open(params[:url]))

    # Get title
    web_title = doc.xpath("//title").text.to_s

    # Get description
    if doc.xpath("//meta[@name='description']/@content").first != nil
      web_desc = doc.xpath("//meta[@name='description']/@content").first.value.to_s
      web_desc = web_desc[0..100] # Limit description to 140 characters.
      web_desc << "..."
    end

    # Get images
    web_images = doc.css('img').map{ |i| i['src'] }

    # Current page image for YouTube.
    if doc.xpath("//meta[@property='og:image']/@content").first != nil
      web_images << doc.xpath("//meta[@property='og:image']/@content").first.value.to_s
    end

    # Delete gif images
    web_images.delete_if {
      |img|
      img[-3..-1] == "gif"
    }

    # Set Hash value
    @web_result = Hash.new
    @web_result['title'] = web_title
    @web_result['description'] = web_desc
    @web_result['images'] = web_images
    @web_result['total_images'] = web_images.count

    respond_to do |format|
      format.json {render :json => @web_result}
    end
  end
end
