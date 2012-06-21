class Ebook < ActiveRecord::Base
  attr_accessible :autor, :descricao, :edicao, :genero, :paginas, :titulo, :valor
end
