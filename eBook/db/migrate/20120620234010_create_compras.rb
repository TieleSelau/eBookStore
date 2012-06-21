class CreateCompras < ActiveRecord::Migration
  def change
    create_table :compras do |t|
      t.references :user
      t.references :ebook
      t.date :data
      t.float :valor

      t.timestamps
    end
    add_index :compras, :user_id
    add_index :compras, :ebook_id
  end
end
