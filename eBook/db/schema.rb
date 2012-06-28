# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120620235644) do

  create_table "compras", :force => true do |t|
    t.integer  "user_id"
    t.integer  "ebook_id"
    t.date     "data"
    t.float    "valor"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "compras", ["ebook_id"], :name => "index_compras_on_ebook_id"
  add_index "compras", ["user_id"], :name => "index_compras_on_user_id"

  create_table "ebooks", :force => true do |t|
    t.string   "titulo"
    t.string   "autor"
    t.text     "descricao"
    t.integer  "edicao"
    t.float    "valor"
    t.string   "genero"
    t.integer  "paginas"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "nome"
    t.string   "email"
    t.string   "genero"
    t.date     "data_nascimento"
    t.string   "senha"
    t.boolean  "admin"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

end
