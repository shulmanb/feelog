COUNT=2 QUEUE=words_parsing  jruby -J-Djruby.thread.pooling=true --fast -S rake environment resque:work
