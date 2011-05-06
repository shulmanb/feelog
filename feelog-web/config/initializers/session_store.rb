# Be sure to restart your server when you modify this file.

Mooderator::Application.config.session_store :cookie_store, :key => '_mooderator_session'

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (redirect_fb the session table with "rake db:sessions:redirect_fb")
# Mooderator::Application.config.session_store :active_record_store
