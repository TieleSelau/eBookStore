class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :nome
      t.string :email
      t.string :genero
      t.date :data_nascimento
      t.string :senha
      t.boolean :admin

      t.timestamps
    end
  end
end
