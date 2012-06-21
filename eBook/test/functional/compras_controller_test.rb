require 'test_helper'

class ComprasControllerTest < ActionController::TestCase
  setup do
    @compra = compras(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:compras)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create compra" do
    assert_difference('Compra.count') do
      post :create, :compra => { :data => @compra.data, :valor => @compra.valor }
    end

    assert_redirected_to compra_path(assigns(:compra))
  end

  test "should show compra" do
    get :show, :id => @compra
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @compra
    assert_response :success
  end

  test "should update compra" do
    put :update, :id => @compra, :compra => { :data => @compra.data, :valor => @compra.valor }
    assert_redirected_to compra_path(assigns(:compra))
  end

  test "should destroy compra" do
    assert_difference('Compra.count', -1) do
      delete :destroy, :id => @compra
    end

    assert_redirected_to compras_path
  end
end
