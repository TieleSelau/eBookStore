class Compra < ActiveRecord::Base
  belongs_to :user
  belongs_to :ebook
  attr_accessible :data, :valor
end
