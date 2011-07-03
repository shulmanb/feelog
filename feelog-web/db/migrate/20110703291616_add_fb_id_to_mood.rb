class AddFbIdToMood < ActiveRecord::Migration
  def self.up
    add_column :moods, :fb_id, :string
  end

  def self.down
    remove_column :moods, :fb_id
  end
end
