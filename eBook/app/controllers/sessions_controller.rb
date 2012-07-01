
class SessionsController < ApplicationController
 
  skip_before_filter :require_login, :only => [:new, :create]

  def new
  end

  def create
    user = User.find_by_nome(params[:username])
    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to root_url, :notice => "Logado!"
    else
      flash.now[:alert] = "Usuario ou senha invalida!"
      render new
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_url, :notice => "Desconectado!"
  end
end
