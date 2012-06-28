class User < ActiveRecord::Base
  attr_accessible :admin, :data_nascimento, :email, :genero, :nome, :senha
  
  validate :email, :senha, :nome, :admin, :presence => true
  validate :email, :nome, :uniqueness => true
  
  def authenticate senha
    #user = find_by_username(username)
    if self && self.senha == senha
      self
    else
      nil
    end
  end
end
