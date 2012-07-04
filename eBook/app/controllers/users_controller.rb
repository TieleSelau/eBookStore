
class UsersController < ApplicationController
	skip_before_filter :require_login, :only => [:new, :create]
	
  # GET /users
  # GET /users.json
  def index
    @users = User.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @users }
    end
  end
  
  # GET /users
  # GET /userss.json
  def ebookusers
    if params[:ebook_id] != nil
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      id = Ebook.find(params[:ebook_id]).id
      puts "---------------------------------"
      compras = Compra.all(:ebook_id == params[:ebook_id])
      #compras.each do |compra|        
        puts compras
      #  puts compra.user_id
      #  puts compra.ebook_id
        puts "---------------------------------"
      #end

      array = []
      User.find(Compra.where(:ebook_id == params[:ebook_id])) do |user|
        compras.each do |compra|
          if compra.ebook_id == user.id && compra.ebook_id == id
            array.push(user)
          end
        end        
        puts user.nome
      end
      
      @users = array
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"

      respond_to do |format|
        format.html # ebookusers.html.erb
        format.json { render :json => @users }
      end
    else
      @users = User.all

      respond_to do |format|
        format.html # index.html.erb
        format.json { render :json => @users }
      end
    end
  end

  # GET /users/1
  # GET /users/1.json
  def show
    @user = User.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @user }
    end
  end

  # GET /users/new
  # GET /users/new.json
  def new
    @user = User.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @user }
    end
  end

  # GET /users/1/edit
  def edit
    @user = User.find(params[:id])
  end

  # POST /users
  # POST /users.json
  def create
    @user = User.new(params[:user])

    respond_to do |format|
      if @user.save
        format.html { redirect_to @user, :notice => 'User was successfully created.' }
        format.json { render :json => @user, :status => :created, :location => @user }
      else
        format.html { render :action => "new" }
        format.json { render :json => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /users/1
  # PUT /users/1.json
  def update
    @user = User.find(params[:id])

    respond_to do |format|
      if @user.update_attributes(params[:user])
        format.html { redirect_to @user, :notice => 'User was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render :action => "edit" }
        format.json { render :json => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.json
  def destroy
    @user = User.find(params[:id])
    @user.destroy

    respond_to do |format|
      format.html { redirect_to users_url }
      format.json { head :no_content }
    end
  end
end
