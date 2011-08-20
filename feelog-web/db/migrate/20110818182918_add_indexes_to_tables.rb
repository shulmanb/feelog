class AddIndexesToTables < ActiveRecord::Migration
  def self.up
    add_index :authorizations, [:provider,:uid], :name=> 'authorizations_login_indx'
    add_index :authorizations, :user_id, :name=> 'users_auth_fk_indx'
    add_index :moods, :fb_id, :name=>'f_b_indx'
    add_index :moods, :user_id, :name=>'users_moods_fk_indx'
  end

  def self.down
    remove_index :authorizations, [:provider,:uid]
    remove_index :moods, :fb_id
    remove_index :moods, :user_id
  end
end
