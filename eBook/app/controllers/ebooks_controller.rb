
class EbooksController < ApplicationController
  # GET /ebooks
  # GET /ebooks.json
  def index
    @ebooks = Ebook.all
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @ebooks }
    end
  end
  
  # GET /ebooks
  # GET /ebooks.json
  def userebooks
    if params[:user_id] != nil
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      id = User.find(params[:user_id]).id
      puts "---------------------------------"
      compras = Compra.all(:user_id == params[:user_id])
      #compras.each do |compra|        
        puts compras
      #  puts compra.user_id
      #  puts compra.ebook_id
        puts "---------------------------------"
      #end

      array = []
      Ebook.find(Compra.where(:user_id == params[:user_id])) do |ebook|
        compras.each do |compra|
          if compra.ebook_id == ebook.id && compra.user_id == id
            array.push(ebook)
          end
        end        
        puts ebook.titulo
      end
      
      @ebooks = array
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"

      respond_to do |format|
        format.html # userebooks.html.erb
        format.json { render :json => @ebooks }
      end
    else
      @ebooks = Ebook.all
      
      respond_to do |format|
        format.html # index.html.erb
        format.json { render :json => @ebooks }
      end
    end
  end

  # GET /ebooks/1
  # GET /ebooks/1.json
  def show
    @ebook = Ebook.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @ebook }
    end
  end

  # GET /ebooks/new
  # GET /ebooks/new.json
  def new
    @ebook = Ebook.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @ebook }
    end
  end

  # GET /ebooks/1/edit
  def edit
    @ebook = Ebook.find(params[:id])
  end

  # POST /ebooks
  # POST /ebooks.json
  def create
    @ebook = Ebook.new(params[:ebook])

    respond_to do |format|
      if @ebook.save
        format.html { redirect_to @ebook, :notice => 'Ebook was successfully created.' }
        format.json { render :json => @ebook, :status => :created, :location => @ebook }
      else
        format.html { render :action => "new" }
        format.json { render :json => @ebook.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /ebooks/1
  # PUT /ebooks/1.json
  def update
    @ebook = Ebook.find(params[:id])

    respond_to do |format|
      if @ebook.update_attributes(params[:ebook])
        format.html { redirect_to @ebook, :notice => 'Ebook was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render :action => "edit" }
        format.json { render :json => @ebook.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /ebooks/1
  # DELETE /ebooks/1.json
  def destroy
    @ebook = Ebook.find(params[:id])
    @ebook.destroy

    respond_to do |format|
      format.html { redirect_to ebooks_url }
      format.json { head :no_content }
    end
  end
end
