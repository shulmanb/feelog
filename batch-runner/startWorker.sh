COUNT=4 QUEUE=friends jruby -J-Djruby.thread.pooling=true -S rake environment resque:work
