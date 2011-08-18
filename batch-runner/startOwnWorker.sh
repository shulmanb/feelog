COUNT=4 QUEUE=own,own_long jruby -J-Djruby.thread.pooling=true --fast -S rake environment resque:work
