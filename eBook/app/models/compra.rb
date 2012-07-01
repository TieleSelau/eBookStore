class Compra < ActiveRecord::Base
  
  attr_accessible :ebook_id, :user_id, :data, :valor
  
  belongs_to :user
  belongs_to :ebook
  
  validates_presence_of :user
  validates_presence_of :ebook
end
