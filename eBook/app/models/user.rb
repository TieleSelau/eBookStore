class User < ActiveRecord::Base
  attr_accessible :admin, :data_nascimento, :email, :genero, :nome, :senha
end
