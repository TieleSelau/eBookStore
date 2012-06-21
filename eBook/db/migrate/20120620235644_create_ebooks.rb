class CreateEbooks < ActiveRecord::Migration
  def change
    create_table :ebooks do |t|
      t.string :titulo
      t.string :autor
      t.text :descricao
      t.integer :edicao
      t.float :valor
      t.string :genero
      t.integer :paginas

      t.timestamps
    end
  end
end
