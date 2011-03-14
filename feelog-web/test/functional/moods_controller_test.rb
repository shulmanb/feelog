require 'test_helper'

class MoodsControllerTest < ActionController::TestCase
  setup do
    @mood = moods(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:moods)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create mood" do
    assert_difference('Mood.count') do
      post :create, :mood => @mood.attributes
    end

    assert_redirected_to mood_path(assigns(:mood))
  end

  test "should show mood" do
    get :show, :id => @mood.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @mood.to_param
    assert_response :success
  end

  test "should update mood" do
    put :update, :id => @mood.to_param, :mood => @mood.attributes
    assert_redirected_to mood_path(assigns(:mood))
  end

  test "should destroy mood" do
    assert_difference('Mood.count', -1) do
      delete :destroy, :id => @mood.to_param
    end

    assert_redirected_to moods_path
  end
end
