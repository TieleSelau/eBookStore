class Ebook < ActiveRecord::Base
  
  attr_accessible :autor, :descricao, :edicao, :genero, :paginas, :titulo, :valor
  
  has_many :compras
  has_many :user, :through => :compra
end
