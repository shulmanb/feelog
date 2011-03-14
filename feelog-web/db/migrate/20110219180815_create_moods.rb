class CreateMoods < ActiveRecord::Migration
  def self.up
    create_table :moods do |t|
      t.integer :mood
      t.integer :user_id
      t.string :desc
      t.float :lat
      t.float :lon
      t.timestamp :report_time
      t.string :url

      t.timestamps
    end
  end

  def self.down
    drop_table :moods
  end
end
